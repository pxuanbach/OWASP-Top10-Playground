const PostgresDB = require('../lib/postgres');

const db = new PostgresDB();

async function init() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'user'
            );
        `);
        console.log('Table users created or already exists.');
    } catch (err) {
        console.error('Error initializing database:', err);
    } finally {
        await db.close();
    }
}

init();
