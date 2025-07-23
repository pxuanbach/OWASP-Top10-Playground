const PostgresDB = require('../lib/postgres');
const _ = require('lodash');

const db = new PostgresDB();

// Get profile by username
async function getProfile(req, res) {
    const username = req.params.username;
    try {
        const result = await db.query('SELECT username, role, location FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Profile not found!' });
        }
        res.json({ success: true, profile: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
}

// Update profile - VULNERABLE: Direct property assignment from req.body
async function updateProfile(req, res) {
    const username = req.params.username;
    try {
        // Get the current profile
        const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Profile not found!' });
        }

        // Get the current profile data
        const currentProfile = { ...result.rows[0] };
        
        // VULNERABLE: Directly merge request body into profile
        // LỖ HỔNG: merge không kiểm soát, có thể ghi đè thuộc tính ngoài ý muốn
        const updatedProfile = _.merge({}, currentProfile, req.body);
        
        // Update the database with the merged object
        const updateResult = await db.query(
            'UPDATE users SET location = $1, role = $2 WHERE username = $3 RETURNING *',
            [updatedProfile.location, updatedProfile.role, username]
        );
        
        if (updateResult.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Failed to update profile' });
        }
        
        res.json({ success: true, profile: updateResult.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
}

// Create new profile
async function createProfile(req, res) {
    const { username, password, role, location } = req.body;
    try {
        const result = await db.query(
            'INSERT INTO users (username, password, role, location) VALUES ($1, $2, $3, $4) RETURNING username, role, location',
            [username, password, role || 'user', location]
        );
        res.status(201).json({ success: true, profile: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') { // unique_violation
            res.status(400).json({ success: false, message: 'Username already exists!' });
        } else {
            res.status(500).json({ success: false, message: 'Database error', error: err.message });
        }
    }
}

module.exports = { getProfile, updateProfile, createProfile };

function createProfile(req, res) {
    const { username, name, email, phone, role } = req.body;
    if (!username || !name || !email || !phone || !role) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin!' });
    }
    if (profiles.some(p => p.username === username)) {
        return res.status(400).json({ success: false, message: 'Username đã tồn tại!' });
    }
    const profile = { username, name, email, phone, role };
    profiles.push(profile);
    res.json({ success: true, profile });
}

module.exports = { getProfile, updateProfile, createProfile };
