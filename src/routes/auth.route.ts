import express from 'express';
import authController from '../controllers/auth.controller';
import { validateUser } from '../middleware/auth.middleware';
import passport from 'passport';
import google from 'passport-google-oauth';
import facebook from 'passport-facebook';
import UserService from '../services/auth.service';

const GoogleStrategy = google.OAuth2Strategy;
const FacebookStrategy = facebook.Strategy;

const router = express.Router();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/login/google/redirect',
    passReqToCallback: true
}, authController.socialLogin));

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/login/facebook/redirect',
    passReqToCallback: true,
    profileFields: ['id', 'email', 'name']
}, authController.socialLogin));

router.post('/login', authController.login);
router.get('/login/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/login/google/redirect', authController.socialLoginCallback({provider: 'google'}));
router.get('/login/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/login/facebook/redirect', authController.socialLoginCallback({provider: 'facebook'}));
router.post('/signup', validateUser, authController.signup);

passport.serializeUser((user: any, done) => done(null, user.id));
passport.deserializeUser((id: string, done) => {
  UserService.getUserById(id).then((user) => done(null, user));
});

export default router;