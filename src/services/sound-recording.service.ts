import { CreateSoundRecordingInput, CreateSoundRecordingResult, GetSoundRecordingFileResult } from '../types/sound-recordings/sound-recording-request.types';
import { db } from './db.service';
import { v4 as uuidv4 } from 'uuid';
import SoundRecording from '../models/SoundRecording';
import Location from '../models/Location';
import { ImagesContainerClient, RecordingsContainerClient } from '../utils/StorageEngine.util';
import HttpError from '../utils/HttpError.util';
import * as TagService from '../services/tag.service';
import { deserializeTags, SELECT_TAGS_BY_RECORDING_SERIALIZED } from '../utils/db-transform.utils';
import { generateShortName } from '../utils/submission.utils';

export async function getPublishedSoundRecordings(): Promise<SoundRecording[]> {
    const results = await db.query(
        `SELECT sr.id, title, short_name, author, description, latitude, longitude, date_recorded, file_location, date_approved, image_strs.img_str AS image_file_string, tag_strs.tag_str AS tags_str
        FROM publications
        JOIN submissions s ON submission_id = s.id
        JOIN sound_recordings sr ON s.sound_recording_id = sr.id
        LEFT JOIN (
            SELECT sound_recording_id AS id, GROUP_CONCAT(file_location SEPARATOR '/') AS img_str
            FROM sound_recording_images GROUP BY sound_recording_id
        ) AS image_strs ON image_strs.id = sr.id
        LEFT JOIN (
            ${SELECT_TAGS_BY_RECORDING_SERIALIZED}
        ) AS tag_strs ON tag_strs.id = sr.id
        `
    );

    const soundRecordings: SoundRecording[] = results.map(row => {
        const location: Location = { lat: parseFloat(row.latitude), lng: parseFloat(row.longitude) };
        const imageFiles = row.image_file_string ? row.image_file_string.split('/') : [];
        const tags = deserializeTags(row.tags_str);

        return {
            id: row.id,
            title: row.title,
            shortName: row.short_name,
            author: row.author,
            description: row.description,
            location,
            dateRecorded: row.date_recorded,
            fileLocation: row.file_location,
            dateApproved: row.date_approved,
            imageFiles,
            tags,
        }
    });

    return soundRecordings;
}

export async function createSoundRecording(soundRecording: CreateSoundRecordingInput): Promise<CreateSoundRecordingResult> {
    const soundRecordingId = uuidv4();
    const title = soundRecording.title;
    const shortName = generateShortName(soundRecording.title);
    const fileLocation = soundRecording.fileLocation;
    const author = soundRecording.author;
    const description = soundRecording.description;
    const dateRecorded = soundRecording.dateRecorded;
    const latitude = soundRecording.location.lat;
    const longitude = soundRecording.location.lng;
    const imageLocations = soundRecording.imageFiles;
    const tags = soundRecording.tags;
    
    const createTagsResult = await TagService.createTagsIfNew({
        tags,
    });

    const params = [
        soundRecordingId,
        title,
        shortName,
        fileLocation,
        author,
        description, 
        dateRecorded,
        latitude,
        longitude
    ];

    await db.insert(
        `INSERT INTO sound_recordings (id, title, short_name, file_location, author, description, date_recorded, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        params
    );

    if (imageLocations && Array.isArray(imageLocations)) {
        const imageInserts: Promise<any>[] = [];
        for (let imgLocation of imageLocations) {
            imageInserts.push(db.insert(
                `INSERT INTO sound_recording_images (sound_recording_id, file_location) VALUES (?, ?)`,
                [
                    soundRecordingId,
                    imgLocation
                ]
            ));
        }
    
        await Promise.all(imageInserts);
    }

    if (createTagsResult.tags.length > 0) {
        await db.insertMultiple(
            `INSERT INTO sound_recording_taggings (tag_id, sound_recording_id) VALUES ?`,
            createTagsResult.tags.map(tag => [ tag.id, soundRecordingId ])
        );
    }

    const result = await db.query(`SELECT * FROM sound_recordings WHERE id = ?`, [soundRecordingId]);

    return result[0] as CreateSoundRecordingResult;
}

export async function getSoundRecordingFileName(id: string): Promise<string> {
    const results = await db.query(
        `SELECT file_location
        FROM sound_recordings
        WHERE id = ?`
    , [id]);

    if (results.length === 0) return null;
    else return results[0].file_location;
}

export async function getSoundRecordingFile(fileName: string, type: 'recording' | 'image' = 'recording'): Promise<GetSoundRecordingFileResult> {
    const containerClient = type === 'image' ? ImagesContainerClient : RecordingsContainerClient;
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    try {
        const blobDownload = await blockBlobClient.download();
        const originalFileName = fileName.split('_')[1];
        const fileStream = blobDownload.readableStreamBody;

        const data: Buffer = await new Promise(res => {
            const buf = [];

            fileStream.on('data', d => buf.push(d));
            fileStream.on('end', () => res(Buffer.concat(buf)));
        });

        return {
            fileName: originalFileName,
            data,
            size: blobDownload.contentLength
        }
    } catch (e) {
        throw new HttpError(404, `Could not retrieve file with filename ${fileName}`);
    }
}

export async function isRecordingPublished(soundRecordingId: string): Promise<boolean> {
    const rows = await db.query(`
        SELECT sr.id
        FROM sound_recordings sr
        JOIN submissions s ON s.sound_recording_id = sr.id
        JOIN publications p ON p.submission_id = s.id
        WHERE sr.id = ?
    `, [soundRecordingId]);

    return rows.length > 0;
}

export async function getSoundRecordingIdForImage(fileName: string): Promise<string> {
    const rows = await db.query(`
        SELECT sri.sound_recording_id AS id
        FROM sound_recording_images sri
        WHERE sri.file_location = ?
    `, [fileName]);
    
    if (rows.length === 0) return null;
    return rows[0].id;
}
