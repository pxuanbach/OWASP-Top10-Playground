const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse urlencoded form data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

// Route to serve login.html
// Phục vụ file tĩnh trong thư mục 'public'
app.use(express.static(path.join(__dirname, 'public')));

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'login.html'));
});

// Route hiển thị màn hình danh sách chấm công
app.get('/attendance', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'attendance.html'));
});


// Route phục vụ giao diện quên mật khẩu
app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'forgot-password.html'));
});


// Import login service
const { handleLogin } = require('./services/loginService');
const { forgotPassword } = require('./services/forgotService');

// API route to handle login
app.post('/api/login', handleLogin);

// API nhận email để reset mật khẩu (không xác minh danh tính)
app.post('/api/forgot-password', forgotPassword);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/forgot-password`);
});
