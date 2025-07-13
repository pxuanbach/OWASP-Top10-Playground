const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 3000;
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Middleware to parse urlencoded form data
app.use(bodyParser.urlencoded({ extended: false }));

// Route trả về file HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname + "/views", 'form.html'));
});

// Route to serve login.html
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'login.html'));
});


// Import login service
const { handleLogin } = require('./services/loginService');
const { fetchURL } = require('./services/formService');

// API route to handle login
app.post('/api/login', handleLogin);

// Route dễ bị SSRF
app.post('/fetch', async (req, res) => {
  const url = req.body.url;
  try {
    const data = await fetchURL(url);
    res.send(`<pre>${data.substring(0, 200)}</pre>`);
  } catch (err) {
    res.send(`<p style="color:red">Error fetching: ${err.message}</p>`);
  }
});

app.get('/dashboard', (req, res) => {
  const session = req.cookies.session;

  if (!session) {
    return res.redirect('/login');
  }

  if (session.endsWith('-fixedsessionid')) {
    return res.sendFile(path.join(__dirname, 'views', 'dashboard.html'));
  }

  res.redirect('/login');
});


app.get('/logout', (req, res) => {
  res.clearCookie('session');
  res.redirect('/login');
});

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'upload.html'));
});

app.post('/upload', upload.single('updateFile'), (req, res) => {
  // ❗❗❗ LỖI: Không kiểm tra chữ ký số
  console.log(`File uploaded to: ${req.file.path}`);
  res.send(`<p>File uploaded (no signature check!): ${req.file.originalname}</p>`);
});


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
