async function login(req, res, next) {
    res.send('Login');
}

async function signup(req, res, next) {
    res.send('Signup');
}

export default { login, signup };