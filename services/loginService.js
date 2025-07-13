// services/loginService.js
// Fake user database
const USERS = {
  admin: 'password123'
};

function handleLogin(req, res) {
    const { username, password } = req.body;
    console.log('Login attempt:', { username, password });
    if (USERS[username] && USERS[username] === password) {
    const sessionId = `${username}-fixedsessionid`;

    res.cookie('session', sessionId);
    return res.redirect('/dashboard');
  }

  res.send(`
    <p style="color:red">Invalid login! Try again.</p>
    <a href="/login">Back</a>
  `);

}

module.exports = { handleLogin };
