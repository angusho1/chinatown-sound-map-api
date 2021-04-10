import express from 'express';
import submissionsController from '../controllers/submissions.controller'

const router = express.Router();

router.get('/submissions', submissionsController.getSubmissions);

export default router;