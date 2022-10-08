import { db } from './db.service';
import Submission, { SubmissionStatus, SubmissionStatusMap } from '../models/Submission';
import { CreateSubmissionInput, CreateSubmissionResult } from '../types/submissions/submisison-request.types';
import HttpError from '../utils/HttpError.util';

export async function getSubmissions(): Promise<Submission[]> {
    const rows = await db.query(`
        SELECT s.id, s.email, s.date_created, s.status, sound_recording_id, sr.title, sr.author, sr.description, sr.latitude, sr.longitude, sr.date_recorded, sr.file_location, image_strs.img_str AS image_file_string
        FROM submissions s
        JOIN sound_recordings sr ON s.sound_recording_id = sr.id
        LEFT JOIN (
            SELECT sound_recording_id AS id, GROUP_CONCAT(file_location SEPARATOR '/') AS img_str
            FROM sound_recording_images GROUP BY sound_recording_id
        ) AS image_strs ON image_strs.id = sr.id
    `);

    const submissions: Submission[] = rows.map(row => {
        return {
            id: row.id,
            soundRecording: {
                id: row.sound_recording_id,
                title: row.title,
                author: row.author,
                description: row.description,
                location: {
                    lat: parseFloat(row.latitude), 
                    lng: parseFloat(row.longitude)
                },
                dateRecorded: row.date_recorded,
                fileLocation: row.file_location,
                imageFiles: row.image_file_string ? row.image_file_string.split('/') : []
            },
            email: row.email,
            dateCreated: row.date_created,
            status: SubmissionStatusMap[parseInt(row.status)]
        }
    });

    return submissions;
}

export async function createSubmission(submission: CreateSubmissionInput): Promise<CreateSubmissionResult> {
    const soundRecordingId = submission.soundRecordingId;
    const email = submission.email;
    const dateCreated = new Date();
    const status = submission.status;

    const insertResult = await db.insert(
        `INSERT INTO submissions (sound_recording_id, email, date_created, status) VALUES (?, ?, ?, ?)`,
        [
            soundRecordingId,
            email,
            dateCreated,
            status
        ]
    );

    const insertId = insertResult.insertId;

    const submissionResult = await db.query(`SELECT * FROM submissions WHERE id = ?`, [insertId]);

    return submissionResult[0] as CreateSubmissionResult;
}

export async function publishSubmission(submissionId: number) {
    const submission = await db.query(`SELECT * FROM submissions WHERE id = ?`, [submissionId]);

    if (!Array.isArray(submission) || submission.length === 0) throw new HttpError(400, `Submission with id ${submissionId} does not exist`);

    const existingPublication = await db.query(`SELECT * FROM publications WHERE submission_id = ?`, [submissionId]);

    if (existingPublication.length > 0) return `Sound recording with id '${submissionId}' has already been published'`;

    await db.insert(
        `INSERT INTO publications (submission_id, date_approved) VALUES (?, ?)`,
        [
            submissionId,
            new Date()
        ]
    );

    await db.update(`
        UPDATE submissions SET status = ${SubmissionStatus.Approved} 
        WHERE id = ?
    `, [submissionId]);

    return `Successfully published sound recording with id '${submissionId}'`;
}
