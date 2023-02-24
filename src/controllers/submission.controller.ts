import { Request, Response, NextFunction } from 'express';
import HttpError from '../utils/HttpError.util';
import multer from 'multer';
import AzureStorageEngine, { MAX_FILE_UPLOAD_SIZE } from '../utils/StorageEngine.util';
import * as SubmissionService from '../services/submission.service';
import * as SoundRecordingService from '../services/sound-recording.service';
import { SubmissionStatus } from '../models/Submission';
import { getSubmissionStatusFromString } from '../utils/submission.utils';
import { SortOption, SubmissionSortField } from '../types/submissions/submisison-request.types';
import fetch from 'node-fetch';

const storage = new AzureStorageEngine();

export function fileFilter(req, file, cb) {
    if (parseInt(req.headers["content-length"]) > MAX_FILE_UPLOAD_SIZE * 5) {
        cb(new HttpError(400, 'Request is too large (max allowed size per file is 5MB).'), false);
    } else {
        cb(null, true);
    }
}

const upload = multer({ storage: storage, limits: { fileSize: MAX_FILE_UPLOAD_SIZE }, fileFilter });

export const uploadFiles = upload.fields([
    { name: 'recording', maxCount: 1 },
    { name: 'image', maxCount: 3 }
]);

export async function getSubmissions(req: Request, res: Response, next: NextFunction) {
    const defaultSort = [{ field: 'dateCreated', directionDesc: true }] as SortOption[];
    const sort = parseSubmissionSort(req) || defaultSort;

    const submissions = await SubmissionService.getSubmissions({ sort });
    res.status(200).json(submissions);
}

export async function createSubmission(req: Request, res: Response, next: NextFunction) {
    try {
        const {
            title,
            email,
            author,
            description,
            fileLocation,
            date: dateRecorded,
            location,
            imageFiles,
            tags
        } = req.body;

        const soundRecording = await SoundRecordingService.createSoundRecording({
            title,
            author,
            description,
            fileLocation,
            dateRecorded,
            location,
            imageFiles,
            tags,
        });

        const submissionResult = await SubmissionService.createSubmission({
            soundRecordingId: soundRecording.id,
            email,
            status: SubmissionStatus.Pending
        });

        const resBody = {
            result: {
                ...soundRecording,
                ...submissionResult
            }
        }

        res.status(201).send(resBody);
    } catch (e) {
        next(e);
    }
}

export async function publishSubmission(req: Request, res: Response, next: NextFunction) {
    try {
        const submissionId = req.params.submissionId;
        if (!submissionId) {
            res.status(400).send(`Submission id was not provided`);
        }

        const publishResult = await SubmissionService.publishSubmission(submissionId);
        
        const resBody = {
            result: publishResult
        }

        res.status(201).send(resBody);
    } catch (e) {
        next(e);
    }
}

export async function editSubmission(req: Request, res: Response, next: NextFunction) {
    try {
        const submissionId = req.params.submissionId;
        const { status } = req.body;
        if (!submissionId) {
            res.status(400).send(`Submission id was not provided`);
        }
        
        const submissionStatus = getSubmissionStatusFromString(status);
        const editResult = await SubmissionService.editSubmissionStatus(submissionId, submissionStatus);

        const resBody = {
            result: editResult
        }

        res.status(200).send(resBody);
    } catch (e) {
        next(e);
    }
}

function parseSubmissionSort(req: Request): SortOption[] | null {
    const sort = req.query.sort;
    if (!sort) return null;
    const sortFields = Array.isArray(sort) ? sort : [sort];
    
    const desc = req.query.desc;
    const descArr = desc !== '' && !desc ? [] : (Array.isArray(desc) ? desc : [desc]);

    const options: SortOption[] = [];
    for (let i = 0; i < sortFields.length; i++) {
        options.push({
            field: sortFields[i] as SubmissionSortField,
            directionDesc: i < descArr.length ? descArr[i] !== 'false' : undefined
        });
    }

    return options;
}

export async function verifyToken(req: Request, res: Response) {
    const token = req.body.token;
    console.log('token', token);
    try {
        const result = await fetch(`https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`);
        res.status(200).json({
            message: 'Success',
            data: await result.json(),
        });
    } catch (e) {
        console.log(e);
        res.status(400).send('Failed to verify token');
    }
}
