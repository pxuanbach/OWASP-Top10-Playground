require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
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

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public'), { dotfiles: 'allow' }));


app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.get('/', (req, res) => {
  // res.sendFile(path.join(__dirname + "/views", 'form.html'));
  return res.redirect('/login');
});

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

const { fetchURL } = require('./services/formService');
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
const { createPost, getPosts, getPostById, updatePost, deletePost } = require('./services/postService');
const { getProfile, updateProfile, createProfile } = require('./services/profileService');

app.get('/api/posts', getPosts);
app.get('/api/posts/:id', getPostById);
app.post('/api/posts', createPost);
app.put('/api/posts/:id', updatePost);
app.delete('/api/posts/:id', deletePost);

// Profile API
app.get('/api/profile/:username', getProfile);
app.put('/api/profile/:username', updateProfile);
app.post('/api/profile', createProfile);

app.use((err, req, res, next) => {
    res.status(500).send('<pre>' + (err.stack || err.toString()) + '</pre>');
});
app.get('/login', (req, res) => {
    const level = req.cookies.SECURITY_LEVEL || 'low';
    if (level === 'high' && req.session && req.session.user) {
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin');
        } else {
            return res.redirect('/home');
        }
    }
    res.sendFile(path.join(__dirname + "/views", 'login.html'));
});

app.get('/register', (req, res) => {
    const level = req.cookies.SECURITY_LEVEL || 'low';
    if (level === 'high' && req.session && req.session.user) {
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin');
        } else {
            return res.redirect('/home');
        }
    }
    res.sendFile(path.join(__dirname + "/views", 'register.html'));
});

app.get('/posts', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'posts.html'));
});

app.get('/profile/:username', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'profile.html'));
});

app.get('/config', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'config.html'));
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});


// Always expose both /low and /high endpoints for each API
// A01: Home & Admin

app.get('/home', (req, res, next) => {
    const level = req.cookies.SECURITY_LEVEL || 'low';
    if (level === 'high') {
        return requireAuth(req, res, next);
    }
    next();
}, (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'home.html'));
});

app.get('/admin', (req, res, next) => {
    const level = req.cookies.SECURITY_LEVEL || 'low';
    if (level === 'high') {
        return requireAuth(req, res, function() {
            return requireAdmin(req, res, next);
        });
    }
    next();
}, (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'admin.html'));
});

// A01 & A07: Login
app.post('/low/api/login', handleLoginLowSecurity);
app.post('/high/api/login', handleLoginHighSecurity);

// A02: Register
app.post('/low/api/register', handleRegisterLowSecurity);
app.post('/high/api/register', handleRegisterHighSecurity);

// A03: User list
app.get('/admin/users', (req, res, next) => {
    const level = req.cookies.SECURITY_LEVEL || 'low';
    if (level === 'high') {
        return requireAuth(req, res, function() {
            return requireAdmin(req, res, next);
        });
    }
    next();
}, (req, res) => {
    const level = req.cookies.SECURITY_LEVEL || 'low';
    if (level === 'high') {
        return getAllUsersHighSecurity(req, res);
    } else {
        return getAllUsersLowSecurity(req, res);
    }
});

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

app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'upload.html'));
});

app.post('/upload', upload.single('updateFile'), (req, res) => {
  // ❗❗❗ LỖI: Không kiểm tra chữ ký số
  console.log(`File uploaded to: ${req.file.path}`);
  res.send(`<p>File uploaded (no signature check!): ${req.file.originalname}</p>`);
});


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/config`);
});
