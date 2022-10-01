import { db } from './db.service';
import Submission, { SubmissionStatus, SubmissionStatusMap } from '../models/Submission';
import { CreateSubmissionInput, CreateSubmissionResult } from '../types/submissions/submisison-request.types';
import HttpError from '../utils/HttpError.util';

export async function getSubmissions(): Promise<Submission[]> {
    const rows = await db.query(
        `SELECT * FROM submissions`
    );

    const submissions: Submission[] = rows.map(row => {
        return {
            id: row.id,
            soundRecording: null,
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

    return `Successfully published sound recording with id '${submissionId}'`;
}
