import { CreateSoundRecordingInput, CreateSoundRecordingResult } from '../types/sound-recordings/sound-recording-request.types';
import { db } from './db.service';
import { v4 as uuidv4 } from 'uuid';

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

    const result = await db.query(`SELECT * FROM sound_recordings WHERE id = ?`, [soundRecordingId]);

    return result[0] as CreateSoundRecordingResult;
}