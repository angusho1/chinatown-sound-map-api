import { Request, Response, NextFunction } from 'express';
import * as SoundRecordingService from '../services/sound-recording.service';
import { authAdmin } from '../middleware/auth.middleware';
import { getContainerClient, removeFile } from '../utils/StorageEngine.util';
import { FileType } from '../types/sound-recordings/file-type.enum';

export const checkRecordingFileAccess = async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    const isPublished = await SoundRecordingService.isRecordingPublished(id);

    if (!isPublished) authAdmin(req, res, next);
    else next();
};

export const checkImageFileAccess = async (req: Request, res: Response, next: NextFunction) => {
    const fileName = req.params.filename;

    const id = await SoundRecordingService.getSoundRecordingIdForImage(fileName);
    if (!id) res.status(404);
    else {
        const isPublished = await SoundRecordingService.isRecordingPublished(id);
        if (!isPublished) authAdmin(req, res, next);
        else next();
    }
};

export const handleSubmissionError = async (err: Error, req: Request, res: Response, next: NextFunction) => {
    const filesToRemove = [];
    if (req.body.fileLocation) {
        filesToRemove.push(
            removeFile(getContainerClient(FileType.RECORDING), req.body.fileLocation)
        );
    }

    if (req.body.imageFiles) {
        const imageContainerClient = getContainerClient(FileType.IMAGE);
        req.body.imageFiles.forEach(imageFile => {
            filesToRemove.push(
                removeFile(imageContainerClient, imageFile)
            );
        });
    }

    await Promise.all(filesToRemove);
    next(err);
};
