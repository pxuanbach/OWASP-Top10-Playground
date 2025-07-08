const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware to parse urlencoded form data
app.use(bodyParser.urlencoded({ extended: false }));

// Route to serve login.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'login.html'));
});


// Import login service
const { handleLogin } = require('./services/loginService');

// API route to handle login
app.post('/api/login', handleLogin);

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
