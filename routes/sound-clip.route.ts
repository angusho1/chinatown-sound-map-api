import express from 'express';
import soundClipController from '../controllers/sound-clip.controller'

const router = express.Router();

router.get('/sound-clips', soundClipController.getSoundClips);

export default router;