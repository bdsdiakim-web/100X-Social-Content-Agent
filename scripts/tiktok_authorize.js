const readline = require('readline');
const crypto = require('crypto');
const {
    loadCredentials,
    generatePKCE,
    saveToken,
    REDIRECT_URI,
    AUTHORIZE_URL,
    TOKEN_URL,
} = require('./utils/tiktok_client');

// Chỉ cần quyền đăng video trực tiếp lên trang cá nhân là đủ cho nhu cầu đăng bài tự động.
const SCOPES = ['user.info.basic', 'video.publish'];

function ask(question) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(question, (answer) => { rl.close(); resolve(answer.trim()); }));
}

async function main() {
    const { client_key, client_secret } = loadCredentials();
    const { codeVerifier, codeChallenge } = generatePKCE();
    const state = crypto.randomBytes(8).toString('hex');

    const authUrl = new URL(AUTHORIZE_URL);
    authUrl.searchParams.set('client_key', client_key);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', SCOPES.join(','));
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    console.log('\n=== BƯỚC 1: Mở link dưới đây bằng trình duyệt, đăng nhập ĐÚNG tài khoản TikTok của bạn và bấm "Cho phép" ===\n');
    console.log(authUrl.toString());
    console.log('\n=== BƯỚC 2: Sau khi cấp quyền, TikTok sẽ chuyển bạn tới 1 trang hiển thị mã (code). Copy mã đó rồi dán vào đây. ===\n');

    const code = await ask('Dán mã (code) vào đây rồi Enter: ');
    if (!code) {
        throw new Error('Chưa nhập mã xác thực.');
    }

    console.log('\n=== BƯỚC 3: Đổi mã xác thực lấy access token + refresh token ===');
    const res = await fetch(TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Cache-Control': 'no-cache' },
        body: new URLSearchParams({
            client_key,
            client_secret,
            code,
            grant_type: 'authorization_code',
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier,
        }),
    });
    const data = await res.json();
    if (!res.ok || data.error) {
        throw new Error(`TikTok trả về lỗi: ${JSON.stringify(data)}`);
    }

    saveToken({ ...data, obtained_at: Date.now() });
    console.log(`\n✅ Xác thực thành công! Đã cấp quyền cho tài khoản TikTok: ${data.open_id}`);
    console.log('Từ giờ có thể chạy "node scripts/tiktok_publish.js <video> <caption>" để tự động đăng, không cần lặp lại bước này (refresh_token sống 365 ngày).');
}

main().catch((err) => {
    console.error('❌ Lỗi xác thực TikTok:', err.message);
    process.exit(1);
});
