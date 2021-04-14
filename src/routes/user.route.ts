import express from 'express';
import userController from '../controllers/user.controller';

const router = express.Router();

router.get('/users', userController.getUsers);

export default router;