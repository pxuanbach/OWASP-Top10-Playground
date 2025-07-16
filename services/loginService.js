const PostgresDB = require('../lib/postgres');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const db = new PostgresDB();


// A01 - Low security version: vulnerable to SQL injection, plaintext password check, role-based redirect
async function handleLoginLowSecurity(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).redirect("/login?error=Missing username or password");
    }

    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
        return res.status(401).redirect("/login?error=Invalid username or password");
    }

    const user = result.rows[0];
    // Hash the input password using md5
    const md5Hash = crypto.createHash('md5').update(password).digest('hex');
    if (md5Hash !== user.password) {
        return res.status(401).redirect("/login?error=Invalid username or password");
    }
    
    // Redirect based on role without session management
    if (user.role === 'admin') {
        return res.redirect('/admin');
    } else {
        return res.redirect('/home');
    }
}

// A01 - High security version: parameterized queries, hashed password check, session management
async function handleLoginHighSecurity(req, res) {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).redirect("/login?error=Missing username or password");
    }

    // Parameterized query prevents SQL injection
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    if (result.rows.length === 0) {
        
        return res.status(401).redirect("/login?error=Invalid username or password");
    }

    const user = result.rows[0];
    // Check if the account is currently locked
    if (user.locked_until && new Date() < new Date(user.locked_until)) {
        return res.status(403).redirect("/login?error=Account is locked. Please try again later.");
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
        // Increase failed login attempts
        const failedAttempts = (user.failed_attempts || 0) + 1;
        let lockedUntil = null;
        if (failedAttempts > 5) {
            // Lock the account for 15 minutes after 5 failed attempts
            lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
        }
        await db.query(
            'UPDATE users SET failed_attempts = $1, locked_until = $2 WHERE id = $3',
            [failedAttempts, lockedUntil, user.id]
        );
        if (lockedUntil) {
            return res.status(403).redirect("/login?error=Account locked due to multiple failed attempts. Please try again later.");
        }
        return res.status(401).redirect("/login?error=Invalid username or password");
    }

    // Successful login: reset failed_attempts and locked_until
    await db.query(
        'UPDATE users SET failed_attempts = 0, locked_until = NULL WHERE id = $1',
        [user.id]
    );

    console.log(`User ${user.username} logged in successfully`);

    // Regenerate session ID to prevent session fixation
    req.session.regenerate((err) => {
        if (err) {
            return res.status(500).redirect("/login?error=Error during login");
        }

        // Store user information in session (excluding sensitive data)
        req.session.user = {
            id: user.id,
            username: user.username,
            role: user.role
        };  

        // Redirect based on role with proper session management
        if (user.role === 'admin') {
            return res.redirect('/admin');
        }
        return res.redirect('/home');
    });
}

module.exports = { handleLoginLowSecurity, handleLoginHighSecurity };
