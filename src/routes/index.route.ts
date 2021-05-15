import express from 'express';
import { requireAuth } from '../middleware/auth.middleware';

const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', (req, res) => res.render('login.html'));
router.get('/auth-test', requireAuth, (req, res) => res.render('auth-test.html'));

export default router;