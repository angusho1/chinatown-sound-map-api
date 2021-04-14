import User from '../models/User';
import UserService from '../services/user.service';

async function login(req, res, next) {
    res.send('Login');
}

async function signup(req, res, next) {
    const { email, password } = req.body;
    const user: User = await UserService.createUser(email, password);

    res.status(201).json({ user });
}

export default { login, signup };