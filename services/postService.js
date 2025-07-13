// In-memory storage
let posts = [
  {
    id: 1,
    title: 'Bài viết mẫu 1',
    content: 'Đây là nội dung bài viết mẫu số 1.',
    author_id: 'dat',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    title: 'Bài viết mẫu 2',
    content: 'Đây là nội dung bài viết mẫu số 2.',
    author_id: 'bach',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    title: 'Bài viết mẫu 3',
    content: 'Đây là nội dung bài viết mẫu số 3.',
    author_id: 'dat',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
let postLogs = posts.map(post => ({
  post_id: post.id,
  title: post.title,
  content: post.content,
  author_id: post.author_id,
  action: 'create',
  created_at: post.created_at
}));
let nextId = 4;

// LỖ HỔNG: Không kiểm tra quyền sở hữu khi sửa/xóa bài viết
async function createPost(req, res) {
    const { title, content, author_id } = req.body;
    if (!title || !content || !author_id) {
        return res.status(400).json({ success: false, message: 'Thiếu thông tin!' });
    }
    const result = await db.query('INSERT INTO posts (title, content, author_id) VALUES ($1, $2, $3) RETURNING id', [title, content, author_id]);
    const postId = result.rows[0].id;
    await db.query('INSERT INTO post_logs (post_id, title, content, author_id, action) VALUES ($1, $2, $3, $4, $5)', [postId, title, content, author_id, 'create']);
    res.json({ success: true, message: 'Đã tạo bài viết!' });
}

async function getPosts(req, res) {
    // Trả về mảng posts, không join user
    res.json({ success: true, posts });
}

async function getPostById(req, res) {
    const { id } = req.params;
    const post = posts.find(p => p.id === parseInt(id));
    if (!post) return res.status(404).json({ success: false, message: 'Không tìm thấy!' });
    res.json({ success: true, post });
}

async function updatePost(req, res) {
    const { id } = req.params;
    const { title, content } = req.body;
    // LỖ HỔNG: Không kiểm tra quyền sở hữu bài viết
    const idx = posts.findIndex(p => p.id === parseInt(id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy!' });
    posts[idx] = {
        ...posts[idx],
        title,
        content,
        updated_at: new Date().toISOString()
    };
    postLogs.push({
        post_id: posts[idx].id,
        title: posts[idx].title,
        content: posts[idx].content,
        author_id: posts[idx].author_id,
        action: 'update',
        created_at: new Date().toISOString()
    });
    res.json({ success: true, message: 'Đã cập nhật!' });
}

async function deletePost(req, res) {
    const { id } = req.params;
    const idx = posts.findIndex(p => p.id === parseInt(id));
    if (idx === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy!' });
    const post = posts[idx];
    posts.splice(idx, 1);
    postLogs.push({
        post_id: post.id,
        title: post.title,
        content: post.content,
        author_id: post.author_id,
        action: 'delete',
        created_at: new Date().toISOString()
    });
    res.json({ success: true, message: 'Đã xóa!' });
}

module.exports = { createPost, getPosts, getPostById, updatePost, deletePost };
