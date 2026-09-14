const fs = require('fs');
const path = require('path');
const { getValidAccessToken } = require('./utils/tiktok_client');

const API_BASE = 'https://open.tiktokapis.com/v2';

/**
 * Đăng 1 video lên TikTok qua Content Posting API (chính thức, không dùng trình duyệt
 * giả lập như Facebook -> tránh rủi ro khóa tài khoản do TikTok chống bot rất gắt).
 */
async function publishToTiktok({ videoPath, caption, privacyLevel = 'SELF_ONLY', disableComment = false, disableDuet = false, disableStitch = false }) {
    if (!fs.existsSync(videoPath)) {
        throw new Error(`Không tìm thấy video tại: ${videoPath}`);
    }
    const accessToken = await getValidAccessToken();
    const videoSize = fs.statSync(videoPath).size;

    console.log(`🚀 [TikTok] Đang khởi tạo phiên đăng cho: ${path.basename(videoPath)} (${(videoSize / 1024 / 1024).toFixed(1)}MB)...`);

    // BƯỚC 1: khởi tạo (init) — TikTok trả về publish_id + upload_url để tải video lên.
    const initRes = await fetch(`${API_BASE}/post/publish/video/init/`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify({
            post_info: {
                title: caption,
                privacy_level: privacyLevel, // SELF_ONLY khi test sandbox; đổi PUBLIC_TO_EVERYONE sau khi app được duyệt
                disable_comment: disableComment,
                disable_duet: disableDuet,
                disable_stitch: disableStitch,
                video_cover_timestamp_ms: 1000,
            },
            source_info: {
                source: 'FILE_UPLOAD',
                video_size: videoSize,
                chunk_size: videoSize,
                total_chunk_count: 1,
            },
        }),
    });
    const initData = await initRes.json();
    if (!initRes.ok || initData.error?.code !== 'ok') {
        throw new Error(`Khởi tạo đăng TikTok thất bại: ${JSON.stringify(initData)}`);
    }
    const { publish_id, upload_url } = initData.data;

    // BƯỚC 2: tải bytes video lên upload_url mà TikTok vừa cấp.
    console.log('📤 [TikTok] Đang tải video lên...');
    const videoBuffer = fs.readFileSync(videoPath);
    const uploadRes = await fetch(upload_url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'video/mp4',
            'Content-Range': `bytes 0-${videoSize - 1}/${videoSize}`,
        },
        body: videoBuffer,
    });
    if (!uploadRes.ok) {
        const errText = await uploadRes.text();
        throw new Error(`Tải video lên TikTok thất bại (HTTP ${uploadRes.status}): ${errText}`);
    }

    // BƯỚC 3: chờ TikTok xử lý xong (poll trạng thái).
    console.log('⏳ [TikTok] Đang chờ TikTok xử lý video...');
    let status = 'PROCESSING_UPLOAD';
    let attempts = 0;
    while ((status === 'PROCESSING_UPLOAD' || status === 'PROCESSING_DOWNLOAD') && attempts < 30) {
        await new Promise((r) => setTimeout(r, 5000));
        const statusRes = await fetch(`${API_BASE}/post/publish/status/fetch/`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify({ publish_id }),
        });
        const statusData = await statusRes.json();
        status = statusData.data?.status;
        console.log(`   ...trạng thái: ${status}`);
        attempts += 1;

        if (status === 'FAILED') {
            throw new Error(`TikTok báo đăng thất bại: ${JSON.stringify(statusData.data)}`);
        }
    }

    console.log(`✅ [TikTok] Hoàn tất! publish_id: ${publish_id}, trạng thái cuối: ${status}`);
    return { publishId: publish_id, status };
}

if (require.main === module) {
    const [, , videoPath, caption, privacyLevel] = process.argv;
    if (!videoPath || !caption) {
        console.log('Usage: node scripts/tiktok_publish.js <video_path> <caption> [privacyLevel=SELF_ONLY]');
        process.exit(1);
    }
    publishToTiktok({
        videoPath,
        caption,
        privacyLevel: privacyLevel || 'SELF_ONLY',
    }).catch((err) => {
        console.error('❌ Lỗi đăng TikTok:', err.message);
        process.exit(1);
    });
}

module.exports = { publishToTiktok };
