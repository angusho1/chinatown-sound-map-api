import express from 'express';
import * as submissionController from '../controllers/submission.controller';
import { authAdmin } from '../middleware/auth.middleware';
import { createSubmissionValidator, validateResult } from '../middleware/validators.middleware';

const router = express.Router();

router.get('/submissions', authAdmin, submissionController.getSubmissions);
router.post('/submissions', submissionController.uploadFiles, createSubmissionValidator, validateResult, submissionController.createSubmission);
router.patch('/submission/:submissionId', authAdmin, submissionController.editSubmission);
router.post('/publish/:submissionId', authAdmin, submissionController.publishSubmission);

export default router;