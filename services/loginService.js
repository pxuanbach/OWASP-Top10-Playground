// services/loginService.js

function handleLogin(req, res) {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    res.send('Login received!');
}

module.exports = { handleLogin };
