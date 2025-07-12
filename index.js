const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse urlencoded form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());


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

// Route hiển thị màn hình danh sách chấm công
app.get('/attendance', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'attendance.html'));
});


// Route phục vụ giao diện quên mật khẩu
app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'forgot-password.html'));
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

// API nhận email để reset mật khẩu (không xác minh danh tính)
app.post('/api/forgot-password', forgotPassword);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/forgot-password`);
});
