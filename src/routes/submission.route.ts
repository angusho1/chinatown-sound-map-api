import express from 'express';
import * as submissionController from '../controllers/submission.controller';
import { authAdmin } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/submissions', authAdmin, submissionController.getSubmissions);
router.post('/submissions', submissionController.uploadFiles, submissionController.createSubmission);
router.post('/publish/:submissionId', submissionController.publishSubmission);

export default router;