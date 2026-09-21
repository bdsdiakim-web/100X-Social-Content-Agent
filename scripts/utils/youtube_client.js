const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');

const CREDENTIALS_PATH = path.join(__dirname, '..', '..', 'credentials', 'youtube_client_secret.json');
const TOKEN_PATH = path.join(__dirname, '..', '..', 'credentials', 'youtube_token.json');

// QUAN TRỌNG: file credentials khai báo redirect_uris là "http://localhost" (không có cổng)
// vì đây là loại "Desktop app" — Google cho phép loopback ở BẤT KỲ cổng nào với loại này,
// nên ta tự chọn 1 cổng cố định để chạy server tạm lúc xin quyền lần đầu.
const LOOPBACK_PORT = 51789;
const REDIRECT_URI = `http://localhost:${LOOPBACK_PORT}`;

function loadCredentials() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error(`Không tìm thấy file credentials/youtube_client_secret.json. Cần tải file OAuth Client (Desktop app) từ Google Cloud Console rồi đặt vào đúng đường dẫn này.`);
    }
    const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    return raw.installed || raw.web;
}

function createOAuthClient() {
    const { client_id, client_secret } = loadCredentials();
    return new google.auth.OAuth2(client_id, client_secret, REDIRECT_URI);
}

// Trả về 1 OAuth2Client đã có token hợp lệ (tự refresh access_token khi hết hạn nhờ có refresh_token).
async function getAuthedClient() {
    if (!fs.existsSync(TOKEN_PATH)) {
        throw new Error(`Chưa xác thực YouTube. Chạy "node scripts/youtube_authorize.js" một lần để cấp quyền trước.`);
    }
    const client = createOAuthClient();
    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
    client.setCredentials(token);

    // Lưu lại token mới (access_token mới, có thể cả refresh_token mới) mỗi khi thư viện tự refresh ngầm.
    client.on('tokens', (newTokens) => {
        const merged = { ...token, ...newTokens };
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(merged, null, 2));
    });

    return client;
}

module.exports = { createOAuthClient, getAuthedClient, TOKEN_PATH, REDIRECT_URI, LOOPBACK_PORT };
