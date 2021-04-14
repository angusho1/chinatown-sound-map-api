import express from 'express';
import submissionController from '../controllers/submission.controller'

const router = express.Router();

router.get('/submissions', submissionController.getSubmissions);

export default router;