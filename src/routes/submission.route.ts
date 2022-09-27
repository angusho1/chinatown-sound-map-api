import express from 'express';
import * as submissionController from '../controllers/submission.controller';

const router = express.Router();

router.get('/submissions', submissionController.getSubmissions);
router.post('/submissions', submissionController.uploadFiles, submissionController.createSubmission);

export default router;