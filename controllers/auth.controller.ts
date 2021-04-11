import User from '../models/User';
import UserService from '../services/users.service';

async function login(req, res, next) {
    res.send('Login');
}

async function signup(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);

    const user: User = await UserService.createUser(email, password);
    console.log(user);

    res.status(201).json({ user: 'Success' });
}

export default { login, signup };