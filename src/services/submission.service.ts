import { db } from './db.service';
import { v4 as uuidv4 } from 'uuid';
import Submission, { SubmissionStatus, SubmissionStatusMap } from '../models/Submission';
import { CreateSubmissionInput, CreateSubmissionResult, GetSubmissionsOptions, SortOption } from '../types/submissions/submisison-request.types';
import HttpError from '../utils/HttpError.util';
import { deserializeCategorizations, SELECT_CATEGORIZATIONS_BY_RECORDING_SERIALIZED } from '../utils/db-transform.utils';

const SUBMISSIONS_COLUMN_NAME_MAP = {
    dateCreated: 's.date_created',
    title: 'sr.title',
    author: 'sr.author',
}

export async function getSubmissions(options?: GetSubmissionsOptions): Promise<Submission[]> {
    let orderSql = options && options.sort ? 'ORDER BY ' : '';
    if (orderSql) {
        orderSql += options.sort.map(option => `${SUBMISSIONS_COLUMN_NAME_MAP[option.field]}${option.directionDesc ? ' DESC' : ''}`).join(', ');
    }

    const rows = await db.query(`
        SELECT s.id, s.email, s.date_created, s.status, sound_recording_id, sr.title, sr.author, sr.description, sr.latitude, sr.longitude, sr.date_recorded, sr.file_location, image_strs.img_str AS image_file_string, category_strs.cat_str AS categories_str
        FROM submissions s
        JOIN sound_recordings sr ON s.sound_recording_id = sr.id
        LEFT JOIN (
            SELECT sound_recording_id AS id, GROUP_CONCAT(file_location SEPARATOR '/') AS img_str
            FROM sound_recording_images GROUP BY sound_recording_id
        ) AS image_strs ON image_strs.id = sr.id
        LEFT JOIN (
            ${SELECT_CATEGORIZATIONS_BY_RECORDING_SERIALIZED}
        ) AS category_strs ON category_strs.id = sr.id
        ${orderSql}
    `);

    const submissions: Submission[] = rows.map(row => {
        const categories = deserializeCategorizations(row.categories_str);

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
                imageFiles: row.image_file_string ? row.image_file_string.split('/') : [],
                categories
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
    const submissionId = uuidv4();
    const email = submission.email;
    const dateCreated = new Date();
    const status = submission.status;

    await db.insert(
        `INSERT INTO submissions (id, sound_recording_id, email, date_created, status) VALUES (?, ?, ?, ?, ?)`,
        [
            submissionId,
            soundRecordingId,
            email,
            dateCreated,
            status
        ]
    );

    const submissionResult = await db.query(`SELECT * FROM submissions WHERE id = ?`, [submissionId]);

    return submissionResult[0] as CreateSubmissionResult;
}

export async function publishSubmission(submissionId: string) {
    const doesSubmissionExist = await submissionExists(submissionId);
    if (!doesSubmissionExist) {
        throw new HttpError(400, `Submission with id ${submissionId} does not exist`);
    }

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

export async function editSubmissionStatus(submissionId: string, newStatus: SubmissionStatus) {
    const doesSubmissionExist = await submissionExists(submissionId);
    if (!doesSubmissionExist) {
        throw new HttpError(400, `Submission with id ${submissionId} does not exist`);
    }

    const rows = await db.query(`SELECT id, status FROM submissions WHERE id = ?`, [submissionId])

    const currentStatus = rows[0].status;

    if (newStatus === SubmissionStatus.Pending && currentStatus !== SubmissionStatus.Rejected) {
        throw new HttpError(400, `Submission with id ${submissionId} cannot be set to status: ${SubmissionStatusMap[newStatus]}`);
    }
    
    if (newStatus === SubmissionStatus.Rejected) {
        if (currentStatus === SubmissionStatus.Approved) {
            await db.query(`DELETE FROM publications WHERE submission_id = ?`, [submissionId]);
        }
        
        if (currentStatus === SubmissionStatus.Rejected) {
            throw new HttpError(400, `Submission with id ${submissionId} cannot be set to status: ${SubmissionStatusMap[newStatus]}`);
        }
    }

    await db.update(`
        UPDATE submissions SET status = ${newStatus} 
        WHERE id = ?
    `, [submissionId]);
}

export async function submissionExists(submissionId: string): Promise<boolean> {
    const submission = await db.query(`SELECT id FROM submissions WHERE id = ?`, [submissionId]);

    return Array.isArray(submission) && submission.length > 0;
}
