// In-memory profile storage for demo
let profiles = [
  {
    username: 'dat',
    name: 'Nguyễn Đức Chí Đạt',
    email: 'dat@example.com',
    phone: '0912345678',
    role: 'user'
  },
  {
    username: 'bach',
    name: 'Phan Xuân Bách',
    email: 'bach@example.com',
    phone: '0987654321',
    role: 'admin'
  }
];

// Lấy profile theo username
function getProfile(req, res) {
  const username = req.params.username;
  const profile = profiles.find(p => p.username === username);
  if (!profile) return res.status(404).json({ success: false, message: 'Không tìm thấy profile!' });
  res.json({ success: true, profile });
}

// Cập nhật profile
function updateProfile(req, res) {
  const username = req.params.username;
  const idx = profiles.findIndex(p => p.username === username);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Không tìm thấy profile!' });
  const { name, email, phone, role } = req.body;
  profiles[idx] = {
    ...profiles[idx],
    name,
    email,
    phone,
    role
  };
  res.json({ success: true, profile: profiles[idx] });
}

// Tạo mới profile
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
