
import { Request, Response, NextFunction } from 'express';
import { getPublishedSoundRecordings } from '../services/sound-recording.service';

export async function getSoundRecordings(req: Request, res: Response, next: NextFunction) {
    const result = await getPublishedSoundRecordings();
    res.status(200).json(result);
}

export default { getSoundRecordings };