import express from 'express';
import authController from '../controllers/auth.controller';
import { validateUser } from '../middleware/auth.middleware';
import passport from 'passport';
import google from 'passport-google-oauth';

const GoogleStrategy = google.OAuth2Strategy;

const router = express.Router();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.AUTH_CALLBACK_URL,
    passReqToCallback: true
},
function(req, accessToken, refreshToken, profile, done) {
    console.log(accessToken);
    console.log(refreshToken);
    console.log(profile);
}));

router.post('/login', authController.login);
router.get('/login/google', passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login'] }))
router.get('/login/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });
router.post('/signup', validateUser, authController.signup);

export default router;