import { Request, Response, NextFunction } from 'express';
import * as SoundRecordingService from '../services/sound-recording.service';
import { authAdmin } from '../middleware/auth.middleware';

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
