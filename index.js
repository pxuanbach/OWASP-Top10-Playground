const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(path.join(__dirname, 'public'), { dotfiles: 'allow' }));


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

app.get('/attendance', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'attendance.html'));
});

app.get('/forgot-password', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'forgot-password.html'));
});

app.get('/posts', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'posts.html'));
});

app.get('/profile/:username', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'profile.html'));
});

const { handleLoginLowSecurity } = require('./services/loginService');
const { handleRegisterLowSecurity } = require('./services/registerService');
const { forgotPassword } = require('./services/forgotService');
const { createPost, getPosts, getPostById, updatePost, deletePost } = require('./services/postService');
const { getProfile, updateProfile, createProfile } = require('./services/profileService');

app.get('/api/posts', getPosts);
app.get('/api/posts/:id', getPostById);
app.post('/api/posts', createPost);
app.put('/api/posts/:id', updatePost);
app.delete('/api/posts/:id', deletePost);

app.post('/api/login', handleLoginLowSecurity);
app.post('/api/register', handleRegisterLowSecurity);
app.post('/api/forgot-password', forgotPassword);

// Profile API
app.get('/api/profile/:username', getProfile);
app.put('/api/profile/:username', updateProfile);
app.post('/api/profile', createProfile);

app.use((err, req, res, next) => {
    res.status(500).send('<pre>' + (err.stack || err.toString()) + '</pre>');
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/posts`);
});
