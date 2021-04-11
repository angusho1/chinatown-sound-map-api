import User from '../models/User';
import UserService from '../services/users.service';

async function login(req, res, next) {
    res.send('Login');
}

async function signup(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    const user: User = await UserService.createUser(email, password);

    res.status(201).json({ user });
}

export default { login, signup };