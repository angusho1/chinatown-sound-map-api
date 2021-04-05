import express from 'express';
import * as SoundClipsService from '../services/sound-clips';

const router = express.Router();

router.get('/', async function(req, res, next) {
    const result = await SoundClipsService.getSoundClips();
    res.send(result);
});

export default router;