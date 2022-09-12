import express from 'express';
import submissionController from '../controllers/submission.controller';
import multer from 'multer';
import CustomStorageEngine from '../utils/StorageEngine.util';

const storage = new CustomStorageEngine();

const upload = multer({ storage: storage });

const router = express.Router();

router.get('/submissions', submissionController.getSubmissions);
router.post('/submissions', upload.single('recording'), submissionController.postSubmissions);

export default router;