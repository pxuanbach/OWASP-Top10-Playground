require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware to parse urlencoded form data
app.use(bodyParser.urlencoded({ extended: false }));

// Session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Require HTTPS in production
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));

// Authentication middleware
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).send('Access denied');
    }
    next();
};

const { 
    handleLoginLowSecurity,
    handleLoginHighSecurity
} = require('./services/loginService');
const {
    handleRegisterLowSecurity,
    handleRegisterHighSecurity
} = require('./services/registerService');
const {
    getAllUsersLowSecurity,
    getAllUsersHighSecurity
} = require('./services/usersService');


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'register.html'));
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

const SECURITY_LEVEL = process.env.SECURITY_LEVEL || 'high';
console.log(`Security level set to: ${SECURITY_LEVEL}`);

if (SECURITY_LEVEL === 'low') {
    // A01
    app.get('/home', (req, res) => {
        res.sendFile(path.join(__dirname + "/views", 'home.html'));
    });
    app.get('/admin', (req, res) => {
        res.sendFile(path.join(__dirname + "/views", 'admin.html'));
    });

    // A01 & A07
    app.post('/api/login', handleLoginLowSecurity);
    
    // A02
    app.post('/api/register', handleRegisterLowSecurity);

    // A03
    app.get('/admin/users', getAllUsersLowSecurity);
} else {
    // A01
    app.get('/home', requireAuth, (req, res) => {
        res.sendFile(path.join(__dirname + "/views", 'home.html'));
    });
    app.get('/admin', requireAuth, requireAdmin, (req, res) => {
        res.sendFile(path.join(__dirname + "/views", 'admin.html'));
    });

    // A01 & A07
    app.post('/api/login', handleLoginHighSecurity);

    // A02
    app.post('/api/register', handleRegisterHighSecurity);

    // A03
    app.get('/admin/users', requireAuth, requireAdmin, getAllUsersHighSecurity);
}

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
