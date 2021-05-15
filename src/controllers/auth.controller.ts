import User from '../models/User';
import UserService from '../services/user.service';
import jwt from 'jsonwebtoken';

const MAX_TOKEN_AGE = 120;

async function signup(req, res, next) {
    const { email, password } = req.body;
    try {
        const userId: number = await UserService.createUser(email, password);
        const token = createToken(userId);
        res.cookie('jwt', token, { httpOnly: true, maxAge: MAX_TOKEN_AGE * 1000 });
        res.status(201).json({ userId });
    } catch (e) {
        next(e);
    }
}

async function login(req, res, next) {
    const { email, password } = req.body;
    try {
        const user = await UserService.loginUser(email, password);
        const token = createToken(user.id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: MAX_TOKEN_AGE * 1000 });
        res.status(200).json({ userId: user.id });
    } catch (e) {
        next(e);
    }
}

async function googleLogin(req, accessToken, refreshToken, profile, done) {
    let currentUser = await UserService.findGoogleUser(profile.id);
    if (!currentUser) {
        currentUser = await UserService.createGoogleUser(profile.id, profile._json.email);
    }
    const token = createToken(currentUser.id);
    done(null, currentUser);
}

function sendToken(req, res, next) {
    const id = req.user.id;
    const token = createToken(id);
    res.cookie('jwt', token, { httpOnly: true, maxAge: MAX_TOKEN_AGE * 1000 });
    res.redirect('/auth-test');
}

function createToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: MAX_TOKEN_AGE });
}

export default { login, signup, googleLogin, sendToken };