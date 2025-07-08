const PostgresDB = require('../lib/postgres');
const bcrypt = require('bcrypt');

const db = new PostgresDB();

async function initData() {
    try {
        // Hash password for high security version
        const passwordHash = await bcrypt.hash('sample123', 10);
        
        // admin without hash password
        await db.query(
            `INSERT INTO users (username, password, role) VALUES ($1, $2, $3)
             ON CONFLICT (username) DO NOTHING`,
            ['admin0', 'sample123', 'admin']
        );

        // admin with hash password
        await db.query(
            `INSERT INTO users (username, password, role) VALUES ($1, $2, $3)
             ON CONFLICT (username) DO NOTHING`,
            ['admin1', passwordHash, 'admin']
        );

        // sample user without hash password
        await db.query(
            `INSERT INTO users (username, password, role) VALUES ($1, $2, $3)
             ON CONFLICT (username) DO NOTHING`,
            ['user0', 'sample123', 'user']
        );

        // sample user with hash password
        await db.query(
            `INSERT INTO users (username, password, role) VALUES ($1, $2, $3)
             ON CONFLICT (username) DO NOTHING`,
            ['user1', passwordHash, 'user']
        );
        console.log('Demo users inserted (if not already present).');
    } catch (err) {
        console.error('Error initializing data:', err);
    } finally {
        await db.close();
    }
}

initData();
