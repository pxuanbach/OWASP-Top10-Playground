async function forgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: 'Vui lòng nhập email!' });
    }
    // TODO: Gửi email thực tế nếu có tích hợp
    // Demo: luôn trả về thành công (không tiết lộ email có tồn tại hay không)
    return res.json({ success: true, message: 'Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu đã được gửi.' });
}

module.exports = { forgotPassword };
