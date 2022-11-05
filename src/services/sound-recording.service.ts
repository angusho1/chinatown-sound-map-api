import { CreateSoundRecordingInput, CreateSoundRecordingResult, GetSoundRecordingFileResult } from '../types/sound-recordings/sound-recording-request.types';
import { db } from './db.service';
import { v4 as uuidv4 } from 'uuid';
import SoundRecording from '../models/SoundRecording';
import Location from '../models/Location';
import { ImagesContainerClient, RecordingsContainerClient } from '../utils/StorageEngine.util';
import HttpError from '../utils/HttpError.util';
import * as CategoryService from '../services/category.service';

export async function getPublishedSoundRecordings(): Promise<SoundRecording[]> {
    const results = await db.query(
        `SELECT sr.id, title, author, description, latitude, longitude, date_recorded, file_location, date_approved, image_strs.img_str AS image_file_string, category_strs.cat_str AS categories_str
        FROM publications
        JOIN submissions s ON submission_id = s.id
        JOIN sound_recordings sr ON s.sound_recording_id = sr.id
        LEFT JOIN (
            SELECT sound_recording_id AS id, GROUP_CONCAT(file_location SEPARATOR '/') AS img_str
            FROM sound_recording_images GROUP BY sound_recording_id
        ) AS image_strs ON image_strs.id = sr.id
        LEFT JOIN (
            SELECT sc.sound_recording_id AS id, GROUP_CONCAT(
                    CONCAT(c.id, ';', c.name)
                    SEPARATOR ','
                ) AS cat_str
            FROM sound_recording_categorizations sc
            JOIN categories c ON c.id = sc.category_id
            GROUP BY sc.sound_recording_id
        ) AS category_strs ON category_strs.id = sr.id
        `
    );

    const soundRecordings: SoundRecording[] = results.map(row => {
        const location: Location = { lat: parseFloat(row.latitude), lng: parseFloat(row.longitude) };
        const imageFiles = row.image_file_string ? row.image_file_string.split('/') : [];
        const categories = row.categories_str ? row.categories_str.split(',').map(categoryStr => {
            const splitStr = categoryStr.split(';');
            return {
                id: splitStr[0],
                name: splitStr[1],
            }
        }) : [];

        return {
            id: row.id,
            title: row.title,
            author: row.author,
            description: row.description,
            location,
            dateRecorded: row.date_recorded,
            fileLocation: row.file_location,
            dateApproved: row.date_approved,
            imageFiles,
            categories,
        }
    });

    return soundRecordings;
}

export async function createSoundRecording(soundRecording: CreateSoundRecordingInput): Promise<CreateSoundRecordingResult> {
    const soundRecordingId = uuidv4();
    const title = soundRecording.title;
    const fileLocation = soundRecording.fileLocation;
    const author = soundRecording.author;
    const description = soundRecording.description;
    const dateRecorded = soundRecording.dateRecorded;
    const latitude = soundRecording.location.lat;
    const longitude = soundRecording.location.lng;
    const imageLocations = soundRecording.imageFiles;
    const categoryIds = soundRecording.existingCategories;
    
    const createCategoriesResult = await CategoryService.createCategories({
        names: soundRecording.newCategories
    });

    categoryIds.push(...createCategoriesResult.categoryIds);

    const params = [
        soundRecordingId,
        title,
        fileLocation,
        author,
        description, 
        dateRecorded,
        latitude,
        longitude
    ];

    await db.insert(
        `INSERT INTO sound_recordings (id, title, file_location, author, description, date_recorded, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
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

    if (categoryIds.length > 0) {
        await db.insertMultiple(
            `INSERT INTO sound_recording_categorizations (category_id, sound_recording_id) VALUES ?`,
            categoryIds.map(categoryId => [ categoryId, soundRecordingId ])
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