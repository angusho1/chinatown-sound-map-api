import { Request, Response, NextFunction } from 'express';
import HttpError from '../utils/HttpError.util';
import multer from 'multer';
import AzureStorageEngine, { MAX_FILE_UPLOAD_SIZE } from '../utils/StorageEngine.util';
import * as SubmissionService from '../services/submission.service';
import * as SoundRecordingService from '../services/sound-recording.service';
import { SubmissionStatus } from '../models/Submission';
import { getSubmissionStatusFromString } from '../utils/submission.utils';

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
    const submissions = await SubmissionService.getSubmissions();
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
            existingCategories,
            newCategories,
        } = req.body;

        const soundRecording = await SoundRecordingService.createSoundRecording({
            title,
            author,
            description,
            fileLocation,
            dateRecorded,
            location,
            imageFiles,
            existingCategories,
            newCategories,
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
