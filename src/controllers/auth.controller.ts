import User from '../models/User';
import UserService from '../services/user.service';

async function login(req, res, next) {
    res.send('Login');
}

async function signup(req, res, next) {
    const { email, password } = req.body;
    try {
        const user: User = await UserService.createUser(email, password);
        res.status(201).json({ user });
    } catch (e) {
        next(e);
    }
}

export default { login, signup };