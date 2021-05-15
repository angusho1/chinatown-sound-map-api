import express from 'express';
import authController from '../controllers/auth.controller';
import { validateUser } from '../middleware/auth.middleware';
import passport from 'passport';
import google from 'passport-google-oauth';
import UserService from '../services/user.service';

const GoogleStrategy = google.OAuth2Strategy;

const router = express.Router();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/login/google/redirect',
    passReqToCallback: true
}, authController.googleLogin));

router.post('/login', authController.login);
router.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/login/google/redirect', 
  // passport.authenticate('google', { failureRedirect: '/login', successRedirect: '/auth-test' }));
  passport.authenticate('google', { failureRedirect: '/login', session: false }),
  authController.sendToken);
router.post('/signup', validateUser, authController.signup);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => {
  UserService.getUserById(id).then((user) => done(null, user));
});

export default router;