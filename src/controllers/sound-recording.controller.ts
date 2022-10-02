
import { Request, Response, NextFunction } from 'express';
import * as SoundRecordingService from '../services/sound-recording.service';
import HttpError from '../utils/HttpError.util';

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

export default { getSoundRecordings, downloadSoundRecording };