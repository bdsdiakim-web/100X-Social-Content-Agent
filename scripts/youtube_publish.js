const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const { getAuthedClient } = require('./utils/youtube_client');

function getShopeeAffiliateLink() {
    try {
        const cfgPath = path.join(__dirname, '..', 'database', 'affiliate_config.json');
        if (!fs.existsSync(cfgPath)) return '';
        const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
        return (cfg.shopee_link || '').trim();
    } catch (e) {
        return '';
    }
}

/**
 * Đăng 1 bình luận top-level trên video (yêu cầu scope youtube.force-ssl, đã xin quyền
 * thêm 2026-09-15 — nếu token cũ chỉ có youtube.upload thì API sẽ trả lỗi 403, cần chạy lại
 * scripts/youtube_authorize.js).
 */
async function postComment(youtube, videoId, text) {
    return youtube.commentThreads.insert({
        part: ['snippet'],
        requestBody: {
            snippet: {
                videoId,
                topLevelComment: { snippet: { textOriginal: text } },
            },
        },
    });
}

/**
 * Đăng 1 video lên YouTube qua YouTube Data API v3 (chính thức, không dùng trình duyệt giả lập
 * như Facebook -> tránh rủi ro khóa tài khoản Google do bị nghi ngờ bot).
 *
 * Link affiliate Shopee (nếu đã cấu hình trong database/affiliate_config.json) được tự động gắn
 * thẳng vào cuối DESCRIPTION của video lúc đăng — description trên YouTube luôn hiển thị link
 * bấm được ngay dưới video, đáng tin cậy hơn đăng riêng thành bình luận (không phụ thuộc thao tác
 * bình luận có thể lỗi). Xem thêm getCaption() bên publish_engine_pw.js — cùng cách làm cho Facebook.
 *
 * masterContentPath (tùy chọn): đường dẫn tới master_content.md của bài — nếu có, sau khi đăng
 * video xong sẽ tự động đăng thêm 1 BÌNH LUẬN chứa toàn bộ nội dung gốc không bị cắt ngắn như
 * description/caption.
 */
async function publishToYoutube({ videoPath, title, description, tags = [], categoryId = '22', privacyStatus = 'public', masterContentPath = null }) {
    if (!fs.existsSync(videoPath)) {
        throw new Error(`Không tìm thấy video tại: ${videoPath}`);
    }

    const shopeeLink = getShopeeAffiliateLink();
    const finalDescription = shopeeLink ? `${(description || '').trim()}\n\n🛒 ${shopeeLink}` : (description || '');

    const auth = await getAuthedClient();
    const youtube = google.youtube({ version: 'v3', auth });

    console.log(`🚀 [YouTube] Đang tải lên: ${path.basename(videoPath)}...`);

    const res = await youtube.videos.insert({
        part: ['snippet', 'status'],
        requestBody: {
            snippet: { title, description: finalDescription, tags, categoryId },
            status: { privacyStatus, selfDeclaredMadeForKids: false },
        },
        media: { body: fs.createReadStream(videoPath) },
    });

    const videoId = res.data.id;
    const videoUrl = `https://youtube.com/shorts/${videoId}`;
    console.log(`✅ [YouTube] Đăng thành công! ${videoUrl}`);

    if (masterContentPath && fs.existsSync(masterContentPath)) {
        try {
            const fullContent = fs.readFileSync(masterContentPath, 'utf8')
                .replace(/^\*\*TIÊU ĐỀ VIDEO:.*$/m, '')
                .replace(/^\*\*TIÊU ĐỀ BÀI ĐĂNG:.*$/m, '')
                .replace(/^---\s*$/m, '')
                .replace(/^##\s*/gm, '')
                .trim();

            console.log('[YouTube] Đang đăng bình luận: nội dung đầy đủ...');
            await postComment(youtube, videoId, fullContent);
            console.log('✅ [YouTube] Đã đăng bình luận nội dung đầy đủ.');
        } catch (commentErr) {
            console.warn('⚠️ [YouTube] Video đã đăng thành công, nhưng lỗi khi đăng bình luận (không ảnh hưởng video):', commentErr.errors || commentErr.message);
        }
    }

    return { videoId, videoUrl };
}

if (require.main === module) {
    const [, , videoPath, title, description, privacyStatus, masterContentPath] = process.argv;
    if (!videoPath || !title) {
        console.log('Usage: node scripts/youtube_publish.js <video_path> <title> <description> [privacyStatus=public] [masterContentPath]');
        process.exit(1);
    }
    publishToYoutube({
        videoPath,
        title,
        description: description || '',
        privacyStatus: privacyStatus || 'public',
        masterContentPath: masterContentPath || null,
    }).catch((err) => {
        console.error('❌ Lỗi đăng YouTube:', err.errors || err.message);
        process.exit(1);
    });
}

module.exports = { publishToYoutube };
