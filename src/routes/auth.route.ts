import express from 'express';
import authController from '../controllers/auth.controller';
import { validateUser } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', validateUser, authController.signup);

export default router;