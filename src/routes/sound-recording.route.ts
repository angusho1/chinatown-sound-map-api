import express from 'express';
import soundRecordingController from '../controllers/sound-recording.controller';

const router = express.Router();

router.get('/sound-recordings', soundRecordingController.getSoundRecordings);
router.get('/sound-recording/:id/download', soundRecordingController.downloadSoundRecording);
router.get('/sound-recording/image/:filename/download', soundRecordingController.downloadImage);

export default router;