import { db } from './db.service';
import Submission, { SubmissionStatus } from '../models/Submission';
import { CreateSubmissionInput, CreateSubmissionResult } from '../types/submissions/submisison-request.types';

export async function getSubmissions(): Promise<Submission[]> {
    const results = await db.query('SELECT * FROM submissions');

    const submissions: Submission[] = results.map(res => {
        return {
            id: '',
            soundRecording: null,
            email: '',
            dateCreated: new Date(),
            status: SubmissionStatus.Pending
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