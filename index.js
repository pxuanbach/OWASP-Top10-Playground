require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const hljs = require('highlight.js');

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
        return res.status(403).send(`
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Access Denied</title>
                <meta http-equiv="refresh" content="5;url=/home" />
                <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
            </head>
            <body class="bg-light">
                <div class="container d-flex justify-content-center align-items-center min-vh-100">
                    <div class="card shadow p-4" style="min-width: 350px; max-width: 400px; width: 100%;">
                        <h2 class="mb-4 text-center text-danger">Access Denied</h2>
                        <p class="text-center">You do not have permission to access this page.</p>
                        <p class="text-center text-secondary">Redirecting to home in 5 seconds...</p>
                        <div class="text-center mt-3"><a href="/home" class="btn btn-primary">Go to Home</a></div>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
    next();
};

const { fetchWithSecurity } = require('./services/formService');
const { 
    handleLoginLowSecurity
} = require('./services/low/loginService');
const { handleLoginHighSecurity } = require('./services/high/loginService')
const { handleRegisterLowSecurity } = require('./services/low/registerService');
const { handleRegisterHighSecurity } = require('./services/high/registerService');
const {
    getAllUsersLowSecurity
} = require('./services//low/usersService');
const {getAllUsersHighSecurity} = require('./services/high/usersService')
const { secureSave } = require('./services/high/uploadService');
const { insecureSave } = require('./services/low/uploadService');
const { createPost, getPosts, getPostById, updatePost, deletePost } = require('./services/postService');
const { createPostLowSecurity, updatePostLowSecurity } = require('./services/low/postService');
const { createPostHighSecurity, updatePostHighSecurity } = require('./services/high/postService');
const { getProfile, updateProfile, createProfile } = require('./services/profileService');

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

app.get('/api/posts', getPosts);
app.get('/api/posts/:id', getPostById);
app.delete('/api/posts/:id', deletePost);

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

// A04
app.post('/low/api/posts', createPostLowSecurity);
app.post('/high/api/posts', createPostHighSecurity);
app.put('/low/api/posts/:id', updatePostLowSecurity);
app.put('/high/api/posts/:id', updatePostHighSecurity);

// A10
app.get('/form-preview', (req, res) => {
  res.sendFile(path.join(__dirname + "/views", 'form.html'));
});

app.post('/fetch', async (req, res) => {
  const { url } = req.body;
  const level = req.cookies.SECURITY_LEVEL || 'low';

  try {
    const data = await fetchWithSecurity(url, level);
    res.send(`<pre>${JSON.stringify(data, null, 2)}</pre>`);
  } catch (err) {
    res.status(400).send(`<p style="color:red">Error: ${err.message}</p>`);
  }
});

// A08
app.get('/upload', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'upload.html'));
});

// A08 - định tuyến theo SECURITY_LEVEL
app.post('/upload', upload.single('updateFile'), (req, res) => {
  const level = req.cookies.SECURITY_LEVEL || 'low';

  if (level === 'high') {
    // ✅ FIX: kiểm tra chữ ký số
    const expectedHash = req.body.expectedHash?.trim();
    try {
      const result = secureSave(req.file, expectedHash);
      res.send(`<p>(SECURE) Verified & uploaded: ${result.filename}</p>`);
    } catch (err) {
      res.status(400).send(`<p style="color:red">Error: ${err.message}</p>`);
    }
  } else {
    // ❌ Không kiểm tra
    const result = insecureSave(req.file);
    res.send(`<p>(INSECURE) File uploaded: ${result.filename}</p>`);
  }
})

// View source
const pathToFormService = path.join(__dirname, 'services', 'formservice.js');

app.get('/form-preview-source', (req, res) => {
  const level = req.cookies.SECURITY_LEVEL || 'low';

  fs.readFile(pathToFormService, 'utf8', (err, code) => {
    if (err) return res.status(500).send('Failed to load source code.');

    let extracted = '';
    if (level === 'low') {
      extracted = extractFunction(code, 'fetchURL');
    } else if (level === 'medium') {
      extracted = extractFunction(code, 'safeFetchURL');
    } else if (level === 'high') {
      extracted = extractFunction(code, 'verySafeFetchURL');
    }

    const highlighted = hljs.highlight(extracted, { language: 'javascript' }).value;

    res.send(`
      <html>
        <head>
          <title>View Source</title>
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css">
        </head>
        <body>
          <h2>Server Code: <code>services/formservice.js</code> (${level})</h2>
          <pre><code class="hljs language-js">${highlighted}</code></pre>
          <a href="/fetch">← Back</a>
        </body>
      </html>
    `);
  });
});

function extractFunction(code, functionName) {
  const regex = new RegExp(`async function ${functionName}\\([^)]*\\) \\{[\\s\\S]*?^\\}`, 'm');
  const match = code.match(regex);
  return match ? match[0] : `// Cannot find function ${functionName}`;
}


app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}/config`);
});
