import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { Request, Response, NextFunction } from 'express';

const router = express.Router();

router.get('/', function(req: Request, res: Response, next: NextFunction) {
  res.json({ message: 'Welcome' });
});

// router.get('/login', (req: Request, res: Response) => res.render('login.html'));
// router.get('/auth-test', requireAuth, (req: Request, res: Response) => res.render('auth-test.html'));

export default router;