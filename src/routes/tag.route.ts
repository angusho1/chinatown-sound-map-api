import express from 'express';
import tagController from '../controllers/tag.controller';

const router = express.Router();

router.get('/tags', tagController.getTags);
router.post('/tags', tagController.createTag);

export default router;