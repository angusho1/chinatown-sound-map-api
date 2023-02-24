if (process.env.ENV_FILE_PATH) {
    require('dotenv').config({ path: process.env.ENV_FILE_PATH });
} else {
    require('dotenv').config();
}

import path from 'path';
import fs from 'fs';
import { FileType } from "../src/types/sound-recordings/file-type.enum";
import { getContainerClient } from "../src/utils/StorageEngine.util";
import * as SoundRecordingService from '../src/services/sound-recording.service';
import * as SubmissionService from '../src/services/submission.service';
import { SubmissionStatus } from "../src/models/Submission";
import { v4 as uuidv4 } from 'uuid';
import { parse } from 'csv-parse/sync';
import { db } from '../src/services/db.service';
import SoundRecordingTag from '../src/models/SoundRecordingTag';

interface CreateRecordingInputs {
    title: string;
    author: string;
    email: string;
    description: string;
    date: string;
    latitude: number;
    longitude: number;
    audioFilePath: string;
    imageFilePaths: string[];
    tags: SoundRecordingTag[];
}

const getRecordingData = (csvFilePath: string, dataFilePath: string): CreateRecordingInputs[] => {
    const data = fs.readFileSync(csvFilePath);
    const records = parse(data.toString(), {
        columns: true,
        skip_empty_lines: true
    });
    return records.map((record: any): CreateRecordingInputs => {
        return {
            title: record.Title,
            author: record.Author,
            email: record.Email,
            date: record.Date,
            description: record.Description,
            latitude: record.Latitude,
            longitude: record.Longitude,
            audioFilePath: path.join(dataFilePath, record.Shortname, `${record.Shortname}.mp3`),
            imageFilePaths: [
                path.join(dataFilePath, record.Shortname, `${record.Shortname}.jpeg`),
                path.join(dataFilePath, record.Shortname, `${record.Shortname}.jpg`),
            ],
            tags: [{ id: '', name: 'Chinatown Vancouver' }],
        };
    });
};

const readFile = async (filePath: string): Promise<ArrayBuffer> => {
    return new Promise((res, rej) => {
        fs.readFile(filePath, (err, data) => {
            if (err) rej(err);
            else res(data.buffer);
        });
    });
};

const uploadFile = async (filePath: string, type: FileType): Promise<string> => {
    try {
        const buffer = await readFile(filePath);

        const containerClient = getContainerClient(type);
        const blobName = `${uuidv4()}_${path.basename(filePath)}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        await blockBlobClient.uploadData(buffer);
    
        return blobName;
    } catch (e) {
        return null;
    }
};

const createPublishedRecording = async (inputs: CreateRecordingInputs) => {
    const {
        title,
        author,
        email,
        description,
        date,
        latitude,
        longitude,
        audioFilePath,
        imageFilePaths,
        tags,
    } = inputs;

    const results = await db.query(
        `SELECT id
        FROM sound_recordings
        WHERE title = :title AND author = :author`,
        { title, author },
    ) as any;

    if (results.length > 0) return `Already exists - ${title} by ${author}`;

    const fileLocation = await uploadFile(audioFilePath, FileType.RECORDING);
    if (!fileLocation) return `Recording file missing for ${title}`;
    const imageFiles = (await Promise.all(imageFilePaths.map(filePath => {
        return uploadFile(filePath, FileType.IMAGE);
    }))).filter(file => !!file);

    const soundRecording = await SoundRecordingService.createSoundRecording({
        title,
        author,
        description,
        fileLocation,
        dateRecorded: date !== 'NULL' ? new Date(date) : null,
        location: {
            lat: latitude,
            lng: longitude,
        },
        imageFiles: imageFiles,
        tags,
    });

    const submissionResult = await SubmissionService.createSubmission({
        soundRecordingId: soundRecording.id,
        email,
        status: SubmissionStatus.Pending,
    });

    const publishResult = await SubmissionService.publishSubmission(submissionResult.id);

    return publishResult;
};


const csvFilePath = path.resolve(process.argv[2]);
const dataFilePath = path.resolve(process.argv[3]);

const recordingData = getRecordingData(csvFilePath, dataFilePath);

const recordingJobs = recordingData.map(r => createPublishedRecording(r));

Promise.all(recordingJobs).then(res => {
    console.log(res);
    process.exit(0);
});
