import express from 'express';
import submissionController from '../controllers/submission.controller';
import multer from 'multer';
import CustomStorageEngine, { MAX_FILE_UPLOAD_SIZE } from '../utils/StorageEngine.util';

const storage = new CustomStorageEngine();

const upload = multer({ storage: storage, limits: { fileSize: MAX_FILE_UPLOAD_SIZE } });

const uploadFiles = upload.fields([
    { name: 'recording', maxCount: 1},
]);

const router = express.Router();

router.get('/submissions', submissionController.getSubmissions);
router.post('/submissions', uploadFiles, submissionController.postSubmissions);

export default router;