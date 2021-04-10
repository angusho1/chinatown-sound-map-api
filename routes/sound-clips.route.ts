import express from 'express';
import soundClipsController from '../controllers/sound-clips.controller'

const router = express.Router();

router.get('/sound-clips', soundClipsController.getSoundClips);

export default router;