const PostgresDB = require('../lib/postgres');
const bcrypt = require('bcrypt');
const db = new PostgresDB();

// Low security version: vulnerable to SQL injection, plaintext password check, role-based redirect
async function handleLoginLowSecurity(req, res) {
    const { username, password } = req.body;

    // Vulnerable: direct string interpolation (SQL injection risk!)
    const query = `SELECT * FROM users WHERE username = '${username}'`;
    const result = await db.query(query);
    if (result.rows.length === 0) {
        return res.status(401).send('Invalid username or password');
    }
    const user = result.rows[0];
    // Plaintext password check
    if (user.password !== password) {
        return res.status(401).send('Invalid username or password');
    }
    
    // Redirect based on role
    if (user.role === 'admin') {
        return res.redirect('/admin');
    } else {
        return res.redirect('/home');
    }
}

// High security version: parameterized queries, hashed password check
async function handleLoginHighSecurity(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).send('Missing username or password');
    }

    // Parameterized query prevents SQL injection
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
        return res.status(401).send('Invalid username or password');
    }
    const user = result.rows[0];
    // Secure password check using bcrypt
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        return res.status(401).send('Invalid username or password');
    }
    res.send('Login successful!');
}

module.exports = { handleLoginLowSecurity, handleLoginHighSecurity };
