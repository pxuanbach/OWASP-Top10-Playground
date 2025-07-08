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



// Import login service
const { handleLogin } = require('./services/loginService');

// API route to handle login
app.post('/api/login', handleLogin);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/attendance`);
});
