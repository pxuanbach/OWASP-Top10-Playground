const PostgresDB = require('../../lib/postgres');

// ❌ A03 - Low security: không escaping, không query param
function renderUserTable(users, securityLevel = 'low') {
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
                            <td>${user.id}</td>
                            <td>${user.username}</td>
                            <td>${user.role}</td>
                            <td>${user.location || ''}</td>
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

async function getAllUsersLowSecurity(req, res) {
    const db = new PostgresDB();
    const search = req.query.q || '';
    let query = 'SELECT id, username, role, location FROM users';
    if (search) {
        query += ` WHERE username ILIKE '%${search}%'`;
    }
    const result = await db.query(query);
    await db.close();
    res.send(renderUserTable(result.rows, 'low'));
}

module.exports = { getAllUsersLowSecurity };
