
import { Request, Response, NextFunction } from 'express';
import * as SoundRecordingService from '../services/sound-recording.service';
import HttpError from '../utils/HttpError.util';
import path from 'path';

export async function getSoundRecordings(req: Request, res: Response, next: NextFunction) {
    const result = await SoundRecordingService.getPublishedSoundRecordings();
    res.status(200).json(result);
}

export async function downloadSoundRecording(req: Request, res: Response, next: NextFunction) {
    const id = req.params.id;

    try {
        const fileName = await SoundRecordingService.getSoundRecordingFileName(id);
        if (fileName === null) throw new HttpError(404, `Recording of id '${id}' does not exist`);

        const fileResult = await SoundRecordingService.getSoundRecordingFile(fileName);

        res.writeHead(200, {
            'Access-Control-Expose-Headers': 'Content-Disposition',
            'Content-Type': 'audio/mpeg',
            'Content-Length': fileResult.size,
            'Content-Disposition': `attachment; filename=${fileResult.fileName}`
        });

        res.write(fileResult.data, 'binary');
        res.end();
    } catch (e) {
        next(e);
    }
}

export async function downloadImage(req: Request, res: Response, next: NextFunction) {
    const fileName = req.params.filename;

    try {
        const fileResult = await SoundRecordingService.getSoundRecordingFile(fileName, 'image');

        let contentType: string;
        const ext = path.extname(fileResult.fileName);
        if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
        else if (ext === '.png') contentType = 'image/png';
        else contentType = 'image/*'

        res.writeHead(200, {
            'Access-Control-Expose-Headers': 'Content-Disposition',
            'Content-Type': contentType,
            'Content-Length': fileResult.size,
            'Content-Disposition': `attachment; filename=${fileResult.fileName}`
        });

        res.write(fileResult.data, 'binary');
        res.end();
    } catch (e) {
        next(e);
    }
}

export default { getSoundRecordings, downloadSoundRecording, downloadImage };