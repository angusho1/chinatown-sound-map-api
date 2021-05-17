import * as SoundClipService from '../services/sound-clip.service';
import { Request, Response, NextFunction } from 'express';

async function getSoundClips(req: Request, res: Response, next: NextFunction) {
    const result = await SoundClipService.getSoundClips();
    res.send(result);
}

export default { getSoundClips }