import { db } from './db.service';
import Submission, { SubmissionStatus } from '../models/Submission';

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

export async function createSubmission(): Promise<any> {
    return 'test';
}