const PostgresDB = require('../lib/postgres');
const db = new PostgresDB();

// Create a new post
async function createPost(req, res) {
    const { title, content, author_id } = req.body;
    if (!title || !content || !author_id) {
        return res.status(400).json({ success: false, message: 'Missing required fields!' });
    }
    try {
        const result = await db.query(
            'INSERT INTO posts (title, content, author_id, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING id, title, content, author_id, created_at, updated_at',
            [title, content, author_id]
        );
        const post = result.rows[0];
        // Optionally log the creation in post_logs if the table exists
        // await db.query('INSERT INTO post_logs (post_id, title, content, author_id, action, created_at) VALUES ($1, $2, $3, $4, $5, NOW())', [post.id, post.title, post.content, post.author_id, 'create']);
        res.status(201).json({ success: true, message: 'Post created successfully!', post });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
}

// Get all posts
async function getPosts(req, res) {
    try {
        const result = await db.query('SELECT id, title, content, author_id, created_at, updated_at FROM posts ORDER BY created_at DESC');
        res.json({ success: true, posts: result.rows });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
}

// Get a post by ID
async function getPostById(req, res) {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT id, title, content, author_id, created_at, updated_at FROM posts WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Post not found!' });
        }
        res.json({ success: true, post: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
}

// Update a post
async function updatePost(req, res) {
    const { id } = req.params;
    const { title, content } = req.body;
    if (!title && !content) {
        return res.status(400).json({ success: false, message: 'No fields to update!' });
    }
    try {
        const result = await db.query(
            'UPDATE posts SET title = COALESCE($1, title), content = COALESCE($2, content), updated_at = NOW() WHERE id = $3 RETURNING id, title, content, author_id, created_at, updated_at',
            [title, content, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Post not found!' });
        }
        // Optionally log the update in post_logs if the table exists
        // await db.query('INSERT INTO post_logs (post_id, title, content, author_id, action, created_at) VALUES ($1, $2, $3, $4, $5, NOW())', [result.rows[0].id, result.rows[0].title, result.rows[0].content, result.rows[0].author_id, 'update']);
        res.json({ success: true, post: result.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
}

// Delete a post
async function deletePost(req, res) {
    const { id } = req.params;
    try {
        const result = await db.query('DELETE FROM posts WHERE id = $1 RETURNING id, title, content, author_id, created_at, updated_at', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Post not found!' });
        }
        // Optionally log the deletion in post_logs if the table exists
        // await db.query('INSERT INTO post_logs (post_id, title, content, author_id, action, created_at) VALUES ($1, $2, $3, $4, $5, NOW())', [result.rows[0].id, result.rows[0].title, result.rows[0].content, result.rows[0].author_id, 'delete']);
        res.json({ success: true, message: 'Post deleted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Database error', error: err.message });
    }
}

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost };
