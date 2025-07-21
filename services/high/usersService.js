const PostgresDB = require('../../lib/postgres');

function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    str = String(str);
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// ✅ A03 - High security: escaping + parameterized query
function renderUserTable(users, securityLevel = 'high') {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>User List</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body class="bg-light">
    <div class="container d-flex justify-content-center align-items-center min-vh-100">
        <div class="card shadow p-4 w-100" style="max-width: 700px;">
            <h2 class="mb-4 text-center">User List</h2>
            <table class="table table-bordered table-striped">
                <thead class="table-light">
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Role</th>
                        <th>Location</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${escapeHtml(user.id)}</td>
                            <td>${escapeHtml(user.username)}</td>
                            <td>${escapeHtml(user.role)}</td>
                            <td>${escapeHtml(user.location || '')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            <div class="mb-3 text-center text-secondary" style="font-size: 14px;">Security level: ${securityLevel}</div>
        </div>
    </div>
</body>
</html>`;
}

async function getAllUsersHighSecurity(req, res) {
    const db = new PostgresDB();
    const search = req.query.q || '';
    const query = 'SELECT id, username, role, location FROM users WHERE username ILIKE $1';
    const result = await db.query(query, [`%${search}%`]);
    await db.close();
    res.send(renderUserTable(result.rows, 'high'));
}

module.exports = { getAllUsersHighSecurity };
