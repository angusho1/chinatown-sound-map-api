import express from 'express';
import usersController from '../controllers/users.controller';

const router = express.Router();

router.get('/users', usersController.getUsers);

export default router;