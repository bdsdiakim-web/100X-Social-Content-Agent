const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CREDENTIALS_PATH = path.join(__dirname, '..', '..', 'credentials', 'tiktok_client_secret.json');
const TOKEN_PATH = path.join(__dirname, '..', '..', 'credentials', 'tiktok_token.json');

// QUAN TRỌNG: TikTok KHÔNG cho dùng redirect_uri kiểu "http://localhost" như Google.
// Bắt buộc phải là 1 URL https thuộc domain đã xác minh quyền sở hữu (đã xác minh
// domain GitHub Pages ở bước trước). Trang này chỉ hiển thị "code" để copy tay,
// không có backend nên không tự động bắt được code như YouTube.
const REDIRECT_URI = 'https://vuamatpho.xyz/oauth-callback.html';

const AUTHORIZE_URL = 'https://www.tiktok.com/v2/auth/authorize/';
const TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';

function loadCredentials() {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error(`Không tìm thấy file credentials/tiktok_client_secret.json. Cần lấy Client Key + Client Secret từ TikTok Developer Portal rồi dán vào file đó.`);
    }
    const raw = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
    if (!raw.client_key || raw.client_key.startsWith('DÁN_')) {
        throw new Error(`File credentials/tiktok_client_secret.json chưa được điền giá trị thật.`);
    }
    return raw;
}

// PKCE bắt buộc với TikTok OAuth v2.
function generatePKCE() {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto.createHash('sha256').update(codeVerifier).digest('base64url');
    return { codeVerifier, codeChallenge };
}

function saveToken(tokenData) {
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokenData, null, 2));
}

function loadToken() {
    if (!fs.existsSync(TOKEN_PATH)) {
        throw new Error(`Chưa xác thực TikTok. Chạy "node scripts/tiktok_authorize.js" một lần để cấp quyền trước.`);
    }
    return JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));
}

// Trả về access_token còn hạn dùng, tự refresh nếu đã hết hạn (access_token TikTok
// chỉ sống 24h, refresh_token sống 365 ngày và được cấp mới mỗi lần refresh).
async function getValidAccessToken() {
    const { client_key, client_secret } = loadCredentials();
    let token = loadToken();

    const isExpired = Date.now() >= (token.obtained_at + token.expires_in * 1000 - 5 * 60 * 1000);
    if (!isExpired) {
        return token.access_token;
    }

    console.log('🔄 [TikTok] access_token hết hạn, đang tự làm mới bằng refresh_token...');
    const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
        body: new URLSearchParams({
            client_key,
            client_secret,
            grant_type: 'refresh_token',
            refresh_token: token.refresh_token,
        }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
        throw new Error(`Làm mới token TikTok thất bại: ${JSON.stringify(data)}`);
    }

    token = { ...data, obtained_at: Date.now() };
    saveToken(token);
    return token.access_token;
}

module.exports = {
    CREDENTIALS_PATH,
    TOKEN_PATH,
    REDIRECT_URI,
    AUTHORIZE_URL,
    TOKEN_URL,
    loadCredentials,
    generatePKCE,
    saveToken,
    loadToken,
    getValidAccessToken,
};
