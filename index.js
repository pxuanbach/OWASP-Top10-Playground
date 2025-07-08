const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse urlencoded form data
app.use(bodyParser.urlencoded({ extended: false }));


app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'login.html'));
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'register.html'));
});
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'home.html'));
});
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'admin.html'));
});


const { 
    handleLoginLowSecurity,
    handleLoginHighSecurity
} = require('./services/loginService');
const {
    handleRegisterLowSecurity,
    handleRegisterHighSecurity
} = require('./services/registerService');


app.post('/api/login', handleLoginLowSecurity);
// app.post('/api/login', handleLoginHighSecurity);

app.post('/api/register', handleRegisterLowSecurity);
// app.post('/api/register', handleRegisterHighSecurity);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
