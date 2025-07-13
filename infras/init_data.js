const PostgresDB = require('../lib/postgres');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const db = new PostgresDB();

async function initData() {
    try {
        // Hash password for high security version
        const passwordHash = await bcrypt.hash('sample123', 10);
        const md5Hash = crypto.createHash('md5').update('sample123').digest('hex');
        
        // admin with MD5 hash password
        await db.query(
            `INSERT INTO users (username, password, role, failed_attempts, locked_until, location) VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (username) DO NOTHING`,
            ['admin0', md5Hash, 'admin', 0, null, '<script>alert("XSS-admin0")</script>']
        );

        // admin with Bcrypt hash password
        await db.query(
            `INSERT INTO users (username, password, role, failed_attempts, locked_until, location) VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (username) DO NOTHING`,
            ['admin1', passwordHash, 'admin', 0, null, 'Hanoi']
        );

        // sample user with MD5 hash password
        await db.query(
            `INSERT INTO users (username, password, role, failed_attempts, locked_until, location) VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (username) DO NOTHING`,
            ['user0', md5Hash, 'user', 0, null, '<img src=x onerror=alert("XSS-user0")>']
        );

        // sample user with Bcrypt hash password
        await db.query(
            `INSERT INTO users (username, password, role, failed_attempts, locked_until, location) VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (username) DO NOTHING`,
            ['user1', passwordHash, 'user', 0, null, 'Saigon']
        );
        console.log('Demo users inserted (if not already present).');
    } catch (err) {
        console.error('Error initializing data:', err);
    } finally {
        await db.close();
    }
}

initData();
