import express from 'express';
import submissionController, { fileFilter } from '../controllers/submission.controller';

const router = express.Router();

router.get('/submissions', submissionController.getSubmissions);
router.post('/submissions', submissionController.uploadFiles, submissionController.postSubmissions);

export default router;