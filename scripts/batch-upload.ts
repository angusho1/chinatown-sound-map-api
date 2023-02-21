let defaultTag = '';

if (process.env.ENV_FILE_PATH) {
    require('dotenv').config({ path: process.env.ENV_FILE_PATH });
    defaultTag = '583e37d5-3d49-4364-9171-f169c8a3ea61';
} else {
    require('dotenv').config();
    defaultTag = '0a08363f-2781-48cc-b7bf-b09aa8bd7c72';
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

interface CreateRecordingInputs {
    title: string;
    author: string;
    email: string;
    description: string;
    date: string;
    latitude: number;
    longitude: number;
    audioFilePath: string;
    imageFilePath: string;
    tags: string[];
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
            imageFilePath: path.join(dataFilePath, record.Shortname, `${record.Shortname}.jpeg`),
            tags: [defaultTag],
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
        imageFilePath,
        tags,
    } = inputs;

    const results = await db.query(
        `SELECT id
        FROM sound_recordings
        WHERE title = :title AND author = :author`,
        { title, author },
    ) as any;

    if (results.length > 0) return `${title} by ${author} already exists`;

    const fileLocation = await uploadFile(audioFilePath, FileType.RECORDING);
    if (!fileLocation) return `Recording file missing for ${title}`;
    const imageLocation = await uploadFile(imageFilePath, FileType.IMAGE);

    const soundRecording = await SoundRecordingService.createSoundRecording({
        title,
        author,
        description,
        fileLocation,
        dateRecorded: new Date(date),
        location: {
            lat: latitude,
            lng: longitude,
        },
        imageFiles: imageLocation ? [imageLocation] : [],
        existingTags: tags,
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

Promise.all(recordingJobs).then(res => console.log(res));
