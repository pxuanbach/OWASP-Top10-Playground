const PostgresDB = require('../lib/postgres');

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// A03 - Low security: no escaping
function renderUserTableLowSecurity(users) {
    let html = `<html><head><title>Users</title></head><body>`;
    html += `<h2>User List</h2><table border="1"><tr><th>ID</th><th>Username</th><th>Role</th><th>Location</th></tr>`;
    for (const user of users) {
        html += `<tr><td>${user.id}</td><td>${user.username}</td><td>${user.role}</td><td>${user.location || ''}</td></tr>`;
    }
    html += `</table></body></html>`;
    return html;
}

// A03 - High security: HTML escaping
function renderUserTableHighSecurity(users) {
    let html = `<html><head><title>Users</title></head><body>`;
    html += `<h2>User List</h2><table border="1"><tr><th>ID</th><th>Username</th><th>Role</th><th>Location</th></tr>`;
    for (const user of users) {
        html += `<tr><td>${user.id}</td><td>${user.username}</td><td>${user.role}</td><td>${escapeHtml(user.location)}</td></tr>`;
    }
    html += `</table></body></html>`;
    return html;
}

// A03 - Low security: no escaping, no parameterized query 
async function getAllUsersLowSecurity(req, res) {
    const db = new PostgresDB();
    const search = req.query.q || '';

    let query = 'SELECT id, username, role, location FROM users';
    if (search) {
        query += ` WHERE username ILIKE '%${search}%'`;
    }

    const result = await db.query(query);
    await db.close();
    res.send(renderUserTableLowSecurity(result.rows));
}

// A03 - High security: HTML escaping, parameterized query
async function getAllUsersHighSecurity(req, res) {
    const db = new PostgresDB();
    const search = req.query.q || '';
    
    let query = 'SELECT id, username, role, location FROM users';
    if (search) {
        query += ' WHERE username ILIKE $1';
    }

    const result = await db.query(
        `SELECT id, username, role, location FROM users WHERE username ILIKE $1`,
        [`%${search}%`]
    );
    await db.close();
    res.send(renderUserTableHighSecurity(result.rows));
}

module.exports = { getAllUsersLowSecurity, getAllUsersHighSecurity };
