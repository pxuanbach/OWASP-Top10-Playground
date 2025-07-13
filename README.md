# OWASP-Top10-Playground

## Quick Start

1. Initialize infrastructure (Not required if you already have a Postgres instance on your local machine):

    ```sh
    make infras
    ```

2. Install dependencies:

    ```sh
    npm install
    ```

3. Initialize the database and seed demo users:

    ```bash
    make init

    #or
    npm run initdb
    npm run initdata
    ```

4. Start the app:

    ```sh
    npm start
    ```

App will be running at http://localhost:3000


## OWASP Top 10

### A01: Broken Access Control

#### Lỗ hổng trong ứng dụng:

1. Truy cập trực tiếp vào trang admin mà không kiểm tra phiên đăng nhập:
- Tại file `index.js`:
```js
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'admin.html'));
});
```
- Người dùng có thể truy cập trực tiếp vào URL `/admin` mà không cần đăng nhập.

2. Chuyển hướng dựa trên vai trò một cách không an toàn:
- Tại hàm `handleLoginLowSecurity` trong `loginService.js`:
```js
// Redirect based on role
if (user.role === 'admin') {
    return res.redirect('/admin');
} else {
    return res.redirect('/home');
}
```
- Không có cơ chế phiên (session) để duy trì trạng thái đăng nhập
- Người dùng có thể truy cập trang admin sau khi đăng nhập bằng cách truy cập trực tiếp URL

#### Cách khắc phục:

1. Thêm middleware kiểm tra phiên đăng nhập và quyền truy cập:
```js
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

// Apply middleware
app.get('/home', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'home.html'));
});

app.get('/admin', requireAuth, requireAdmin, (req, res) => {
    res.sendFile(path.join(__dirname + "/views", 'admin.html'));
});
```

2. Quản lý phiên đăng nhập an toàn:
```js
const session = require('express-session');

app.use(session({
    secret: 'your-secure-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60  // 1 hour
    }
}));

async function handleLoginHighSecurity(req, res) {
    // ... validate username and password ...
    
    // store user information into session
    req.session.user = {
        id: user.id,
        username: user.username,
        role: user.role
    };
    
    if (user.role === 'admin') {
        return res.redirect('/admin');
    }
    return res.redirect('/home');
}
```

Các biện pháp bảo mật trên giúp:
- Kiểm soát quyền truy cập cho từng route
- Duy trì phiên đăng nhập an toàn với session
- Ngăn chặn truy cập trái phép vào trang admin
- Bảo vệ cookie với các flag secure và httpOnly

### A02: Cryptographic Failures

#### Lỗ hổng trong ứng dụng:

- Tại hàm `handleRegisterLowSecurity` trong file `registerService.js`:

- Mật khẩu được mã hóa yếu bằng **md5** trước khi lưu vào cơ sở dữ liệu (md5 là thuật toán băm đã lỗi thời, dễ bị tấn công brute-force và tra cứu ngược bằng rainbow table):

    ```js
    const md5Hash = crypto.createHash('md5').update(password).digest('hex');
    const query = `INSERT INTO users (username, password, role) VALUES ('${username}', '${md5Hash}', 'user')`;
    await db.query(query);
    ```

- Việc sử dụng md5 không đảm bảo an toàn cho mật khẩu người dùng, vì có thể bị giải ngược hoặc dò ra dễ dàng.

#### Cách khắc phục:

- Tại hàm `handleRegisterHighSecurity` trong file `registerService.js`.

- **Băm mật khẩu** với thuật toán `bcrypt` trước khi lưu vào cơ sở dữ liệu:
    ```js
    const hash = await bcrypt.hash(password, 10);
    await db.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        [username, hash, role || 'user']
    );
    ```
Nhờ đó, ngay cả khi dữ liệu bị rò rỉ, kẻ tấn công cũng không thể lấy được mật khẩu gốc của người dùng.


### A03: Injection

#### Lỗ hổng trong ứng dụng:

1. XSS khi hiển thị thông tin user (location) không được kiểm soát đầu vào:
- Tại route `/admin/users-low` trong `index.js`:
```js
app.get('/admin/users', requireAdmin, async (req, res) => {
    // ...
    for (const user of users) {
        html += `<tr><td>${user.id}</td><td>${user.username}</td><td>${user.role}</td><td>${user.location || ''}</td></tr>`;
    }
    // ...
});
```
- Nếu trường location chứa mã độc (ví dụ: `<script>alert('XSS')</script>`), mã này sẽ được thực thi trên trình duyệt.

2. SQL Injection khi tìm kiếm user:
- Tại route `/admin/users` (low security) nếu truy vấn search được nối chuỗi trực tiếp:
```js
let query = 'SELECT id, username, role, location FROM users';
if (search) {
    query += ` WHERE username ILIKE '%${search}%'`;
}

const result = await db.query(query);
```
- Nếu attacker nhập `q=' UNION SELECT 1, 'abc', 'admin', 'hacked' --` thì sẽ trả về toàn bộ user, hoặc có thể thực thi các truy vấn nguy hiểm khác.

Attack examples:
- `' UNION SELECT 1, version(), current_user, 'x' --`
- `' UNION SELECT 1, datname, 'db', 'x' FROM pg_database --`
- `' UNION SELECT 1, table_name, 'table', 'x' FROM information_schema.tables WHERE table_catalog='owaspdb' AND table_schema='public' --`

#### Cách khắc phục:

1. Sử dụng escape HTML (HTML sanitization) khi render dữ liệu người dùng:
```js
function escapeHtml(str) {
    // ...escaping code...
}
// ...
html += `<tr><td>${user.id}</td><td>${user.username}</td><td>${user.role}</td><td>${escapeHtml(user.location)}</td></tr>`;
```
Nhờ đó, mọi dữ liệu đầu vào đều được chuyển thành text an toàn, ngăn chặn XSS.

2. Luôn sử dụng parameterized query khi truy vấn database:
```js
// An toàn:
const result = await db.query('SELECT * FROM users WHERE username ILIKE $1', [`%${req.query.q}%`]);
```
Nhờ đó, mọi dữ liệu đầu vào đều được kiểm soát, ngăn chặn SQL Injection.

### A04: Insecure Design

### A07: Identification and Authentication Failures

#### Lỗ hổng trong ứng dụng:

1. Không kiểm tra tài khoản bị khóa khi đăng nhập:
- Tại hàm `handleLoginHighSecurity` trong `loginService.js`:
```js
if (user.locked_until && new Date() < new Date(user.locked_until)) {
    return res.status(403).send('Account is locked. Please try again later.');
}
```
- Nếu không có đoạn kiểm tra này, kẻ tấn công có thể gửi nhiều request liên tục (brute-force) để dò mật khẩu user bất kỳ, thậm chí làm tắc nghẽn server.

2. Không giới hạn số lần đăng nhập sai:
- Nếu không tăng biến `failed_attempts` và khóa tài khoản sau nhiều lần sai, hacker có thể brute-force mật khẩu.

#### Cách khắc phục:

- Kiểm tra và cập nhật số lần đăng nhập sai, khóa tài khoản nếu vượt quá giới hạn:
    ```js
    // Increase failed login attempts
    const failedAttempts = (user.failed_attempts || 0) + 1;
    let lockedUntil = null;
    if (failedAttempts >= 5) {
        // Lock the account for 15 minutes after 5 failed attempts
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }
    await db.query(
        'UPDATE users SET failed_attempts = $1, locked_until = $2 WHERE id = $3',
        [failedAttempts, lockedUntil, user.id]
    );
    if (lockedUntil) {
        return res.status(403).send('Account is locked due to too many failed attempts. Please try again later.');
    }
    return res.status(401).send('Invalid username or password');
    ```

Nhờ đó, tài khoản sẽ bị khóa tạm thời sau nhiều lần đăng nhập sai, giảm nguy cơ bị brute-force.
