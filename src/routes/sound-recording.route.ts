import express from 'express';
import soundRecordingController from '../controllers/sound-recording.controller';
import { checkImageFileAccess, checkRecordingFileAccess } from '../middleware/submission.middleware';

const router = express.Router();

router.get('/sound-recordings', soundRecordingController.getSoundRecordings);
router.get('/sound-recording/:id/download', checkRecordingFileAccess, soundRecordingController.downloadSoundRecording);
router.get('/sound-recording/image/:filename/download', checkImageFileAccess, soundRecordingController.downloadImage);

export default router;