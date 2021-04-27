import User from '../models/User';
import UserService from '../services/user.service';
import jwt from 'jsonwebtoken';

async function signup(req, res, next) {
    const { email, password } = req.body;
    try {
        const userId: number = await UserService.createUser(email, password);
        const token = createToken(userId);
        res.cookie('jwt', token, { httpOnly: true, maxAge: 60 * 1000 });
        res.status(201).json({ userId });
    } catch (e) {
        next(e);
    }
}

async function login(req, res, next) {
    const { email, password } = req.body;
    try {
        await UserService.loginUser(email, password);
        res.status(200).json({});
    } catch (e) {
        next(e);
    }
}

function createToken(userId) {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: 60 });
}

export default { login, signup };