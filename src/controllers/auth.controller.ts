import User from '../models/User';
import AuthService from '../services/auth.service';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import HttpError from '../utils/HttpError.util';
import passport from 'passport';

const MAX_TOKEN_AGE = 120;

async function signup(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;
    try {
        const userId: number = await AuthService.createUser(email, password);
        const token = createToken(userId);
        res.cookie('jwt', token, { httpOnly: true, maxAge: MAX_TOKEN_AGE * 1000 });
        res.status(201).json({ userId });
    } catch (e) {
        next(e);
    }
}

async function login(req: Request, res: Response, next: NextFunction) {
    const { email, password } = req.body;
    try {
        const user = await AuthService.validateUser(email, password);
        const token = createToken(user.id);
        res.cookie('jwt', token, { httpOnly: true, maxAge: MAX_TOKEN_AGE * 1000 });
        res.status(200).json({ userId: user.id });
    } catch (e) {
        next(e);
    }
}

async function socialLogin(req: Request, accessToken, refreshToken, profile, done) {
    let currentUser = await AuthService.findOAuthUser(profile.id, profile.provider);
    if (!currentUser) {
        currentUser = await AuthService.createOAuthUser(profile.id, profile._json.email, profile.provider);
    }
    done(null, currentUser, { nextRoute: '/auth-test' });
}

function socialLoginCallback(options: any) {
    const { provider } = options;
    return function (req: Request, res: Response, next: NextFunction) {
        passport.authenticate(provider, { failureRedirect: '/login', session: false },
            (err, user, info) => {
                const { nextRoute } = info;
                if (err) return next(err);
        
                if (nextRoute) {
                    const token = createToken(user.id);
                    res.cookie('jwt', token, { httpOnly: true, maxAge: MAX_TOKEN_AGE * 1000 });
                    return res.redirect(nextRoute);
                } else {
                    req.logIn(user, err => {
                        if (err) return next(err);
                        return res.redirect('/');
                    });
                }
            })(req, res, next);
    }
}

function createToken(userId: number) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: MAX_TOKEN_AGE });
}

export default { login, signup, socialLogin, socialLoginCallback };