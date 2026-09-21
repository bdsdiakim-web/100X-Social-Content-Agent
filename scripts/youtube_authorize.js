const fs = require('fs');
const http = require('http');
const { URL } = require('url');
const { createOAuthClient, TOKEN_PATH, REDIRECT_URI, LOOPBACK_PORT } = require('./utils/youtube_client');

// youtube.upload: đăng video. youtube.force-ssl: cần thêm để được phép tự động đăng bình luận
// (nội dung đầy đủ + link affiliate) trên chính video vừa đăng.
const SCOPES = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.force-ssl',
];

async function main() {
    const client = createOAuthClient();

    const authUrl = client.generateAuthUrl({
        access_type: 'offline', // bắt buộc để nhận được refresh_token (dùng lâu dài, không phải xin quyền lại)
        scope: SCOPES,
        prompt: 'consent', // ép hiện lại màn hình đồng ý để chắc chắn có refresh_token ngay cả khi đã từng cấp quyền trước đó
    });

    console.log('\n=== BƯỚC 1: Mở link dưới đây bằng trình duyệt, đăng nhập ĐÚNG tài khoản YouTube của bạn và bấm "Cho phép" ===\n');
    console.log(authUrl);
    console.log(`\n=== Đang đợi bạn cấp quyền (server tạm chạy tại ${REDIRECT_URI}) ... ===\n`);

    const code = await new Promise((resolve, reject) => {
        const server = http.createServer((req, res) => {
            const url = new URL(req.url, REDIRECT_URI);
            const authCode = url.searchParams.get('code');
            const error = url.searchParams.get('error');

            if (error) {
                res.end('<h2>Đã từ chối cấp quyền. Có thể đóng tab này.</h2>');
                server.close();
                reject(new Error(`Google trả về lỗi: ${error}`));
                return;
            }
            if (authCode) {
                res.end('<h2>Cấp quyền thành công! Bạn có thể đóng tab này và quay lại terminal.</h2>');
                server.close();
                resolve(authCode);
            }
        });
        server.listen(LOOPBACK_PORT);
    });

    console.log('=== BƯỚC 2: Đổi mã xác thực lấy access token + refresh token ===');
    const { tokens } = await client.getToken(code);

    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log(`\n✅ Xác thực thành công! Token đã lưu tại: ${TOKEN_PATH}`);
    console.log('Từ giờ có thể chạy "node scripts/youtube_publish.js <video> <title> <description>" để tự động đăng, không cần lặp lại bước này.');
}

main().catch((err) => {
    console.error('❌ Lỗi xác thực:', err.message);
    process.exit(1);
});
