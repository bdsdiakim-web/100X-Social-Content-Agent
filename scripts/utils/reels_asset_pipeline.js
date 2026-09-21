const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Môi trường API
const PEXELS_KEY = process.env.PEXELS_API_KEY;
const ELEVENLABS_KEY = process.env.ELEVENLABS_API_KEY;
const HEYGEN_KEY = process.env.HEYGEN_API_KEY;
// Base URL cho Micro-Server Express
const MICRO_SERVER_URL = "http://localhost:9876";

/**
 * 📥 Hàm Tải File Chung
 */
async function downloadFile(fileUrl, outputPath) {
    const writer = fs.createWriteStream(outputPath);
    const response = await axios({ url: fileUrl, method: 'GET', responseType: 'stream' });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
    });
}

/**
 * 🎥 1. PEXELS API: Tìm và Tải Video B-Roll
 */
async function getPexelsBroll(query, sceneIndex, destDir) {
    // Nếu đã tải sẵn từ lần render trước (VD: chỉ sửa CSS/font rồi render lại), dùng luôn
    // file cũ thay vì gọi lại API — tránh tốn hạn ngạch Pexels một cách không cần thiết.
    const cachedFileName = `scene_${sceneIndex}_bg.mp4`;
    const cachedPath = path.join(destDir, cachedFileName);
    if (fs.existsSync(cachedPath)) {
        console.log(`[Pexels] Đã có sẵn B-Roll Cảnh ${sceneIndex} từ lần trước, bỏ qua tải lại.`);
        return `${MICRO_SERVER_URL}/ticket-assets/${cachedFileName}`;
    }

    if (!PEXELS_KEY) return console.log(`[Pexels] Thiếu API KEY, giả lập bỏ qua tải B-Roll cho Cảnh ${sceneIndex}`);

    console.log(`[Pexels] Dò tìm B-Roll: "${query}"...`);
    try {
        const res = await axios.get(`https://api.pexels.com/videos/search?query=${query}&orientation=portrait&size=large`, {
            headers: { Authorization: PEXELS_KEY }
        });

        if (res.data.videos.length > 0) {
            // Random trong Top 3 để không bị trùng lặp
            const randomVid = res.data.videos[Math.floor(Math.random() * Math.min(3, res.data.videos.length))];

            // Lọc file gốc 720p (Cấm 4K siêu nặng)
            const safeFiles = randomVid.video_files
                .filter(f => f.file_type === 'video/mp4' && f.height <= 1080)
                .sort((a, b) => Math.abs(a.height - 720) - Math.abs(b.height - 720));
            const hdFile = safeFiles.length > 0 ? safeFiles[0] : (randomVid.video_files.find(f => f.quality === 'hd') || randomVid.video_files[0]);

            const fileName = `scene_${sceneIndex}_bg.mp4`;
            const dest = path.join(destDir, fileName);
            await downloadFile(hdFile.link, dest);
            console.log(`[Pexels] Đã tải xong nền cho Cảnh ${sceneIndex}`);
            return `${MICRO_SERVER_URL}/ticket-assets/${fileName}`;
        }
    } catch (err) {
        console.error(`[Pexels Lỗi] Cảnh ${sceneIndex}:`, err.message);
    }
    return null;
}

/**
 * 🖼️ 1.1. PEXELS API: Tìm và Tải ẢNH THẬT (thay cho video B-roll khi cần hình minh hoạ
 * chân thực/cụ thể hơn — ảnh chụp thật thường "đời thường" và sát tình huống hơn 1 đoạn
 * video loop chung chung). Dùng nguồn ảnh có giấy phép thương mại hợp lệ (Pexels), KHÔNG
 * tải ảnh tuỳ tiện từ Google Images vì rủi ro bản quyền khi dùng cho nội dung có mục đích
 * thương mại (fanpage kinh doanh) — đặc biệt nhạy cảm với 1 kênh tư vấn PHÁP LÝ.
 */
async function getPexelsPhoto(query, sceneIndex, destDir) {
    const cachedFileName = `scene_${sceneIndex}_bg.jpg`;
    const cachedPath = path.join(destDir, cachedFileName);
    if (fs.existsSync(cachedPath)) {
        console.log(`[Pexels Photo] Đã có sẵn ảnh nền Cảnh ${sceneIndex} từ lần trước, bỏ qua tải lại.`);
        return `${MICRO_SERVER_URL}/ticket-assets/${cachedFileName}`;
    }

    if (!PEXELS_KEY) return console.log(`[Pexels Photo] Thiếu API KEY, giả lập bỏ qua tải ảnh cho Cảnh ${sceneIndex}`);

    console.log(`[Pexels Photo] Dò tìm ảnh minh hoạ: "${query}"...`);
    try {
        const res = await axios.get(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=portrait&size=large&per_page=5`, {
            headers: { Authorization: PEXELS_KEY }
        });

        if (res.data.photos && res.data.photos.length > 0) {
            const randomPhoto = res.data.photos[Math.floor(Math.random() * Math.min(3, res.data.photos.length))];
            const imgUrl = randomPhoto.src.large2x || randomPhoto.src.large || randomPhoto.src.original;

            const fileName = `scene_${sceneIndex}_bg.jpg`;
            const dest = path.join(destDir, fileName);
            await downloadFile(imgUrl, dest);
            console.log(`[Pexels Photo] Đã tải xong ảnh nền cho Cảnh ${sceneIndex}`);
            return `${MICRO_SERVER_URL}/ticket-assets/${fileName}`;
        }
    } catch (err) {
        console.error(`[Pexels Photo Lỗi] Cảnh ${sceneIndex}:`, err.message);
    }
    return null;
}

/**
 * 📂 1.5. LOCAL VIDEO: Trích xuất nền Video Cá nhân
 */
async function getLocalBroll(query, sceneIndex) {
    const dir = path.join(__dirname, '..', '..', 'media-input', 'background-video');
    if (!fs.existsSync(dir)) {
        console.log(`[Local Video] Thư mục media-input/background-video chưa tồn tại.`);
        return null;
    }

    // Lấy toàn bộ file mp4/webm (Cấm .mov vì Chromium không hỗ trợ HEVC/H.265)
    let files = fs.readdirSync(dir);
    const validFiles = files.filter(f => f.match(/\.(mp4|webm)$/i));
    const movFiles = files.filter(f => f.match(/\.mov$/i));

    if (movFiles.length > 0 && validFiles.length === 0) {
        console.log(`[Cảnh báo Local Video] Đã tìm thấy file .MOV...`);
    }

    if (validFiles.length === 0) {
        console.log(`[Local Video] Thư mục trống! Fallback sang Pexels.`);
        return null;
    }

    let matches = validFiles;
    if (query) {
        const keywordMatches = validFiles.filter(f => f.toLowerCase().includes(query.toLowerCase()));
        if (keywordMatches.length > 0) {
            matches = keywordMatches;
        } else {
            console.log(`[Local Video] Không tìm thấy khớp cho "${query}", chọn ngẫu nhiên một file...`);
            matches = validFiles;
        }
    }

    const randomFile = matches[Math.floor(Math.random() * matches.length)];
    const servedUrl = `${MICRO_SERVER_URL}/media-input/background-video/${encodeURIComponent(randomFile)}`;
    console.log(`\n📂 [Local Media Found] 🎯 Đã bốc video từ kho cá nhân: "${randomFile}"`);
    console.log(`🔗 [Path] ${servedUrl}`);

    return servedUrl;
}

/**
 * 🎙️ 2. ELEVENLABS API: Ép Giọng & Timestamps Karaoke
 */
async function getElevenLabsVoice(text, sceneIndex, destDir, defaultVoiceId = "pNInz6obbf5AWCGqeXbU") {
    const voiceId = process.env.ELEVENLABS_VOICE_ID || defaultVoiceId;
    if (!ELEVENLABS_KEY || !text) return console.log(`[ElevenLabs] Thiếu KEY/Text tại Cảnh ${sceneIndex}`);

    // Dùng lại giọng đã tải sẵn nếu render lại chỉ để sửa CSS/font, tránh tốn API lần nữa.
    const cachedAudioName = `scene_${sceneIndex}_voice.mp3`;
    const cachedAudio = path.join(destDir, cachedAudioName);
    const cachedKaraokeName = `scene_${sceneIndex}_karaoke.json`;
    const cachedKaraoke = path.join(destDir, cachedKaraokeName);
    if (fs.existsSync(cachedAudio)) {
        console.log(`[ElevenLabs] Đã có sẵn giọng đọc Cảnh ${sceneIndex} từ lần trước, bỏ qua gọi API lại.`);
        return {
            audioPath: `${MICRO_SERVER_URL}/ticket-assets/${cachedAudioName}`,
            karaokePath: fs.existsSync(cachedKaraoke) ? `${MICRO_SERVER_URL}/ticket-assets/${cachedKaraokeName}` : null,
            absoluteAudioPath: cachedAudio
        };
    }

    console.log(`[ElevenLabs] Dùng VoiceID "${voiceId}" chuyển Text thành Voice Cảnh ${sceneIndex}...`);
    try {
        const destAudio = path.join(destDir, `scene_${sceneIndex}_voice.mp3`);

        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`,
            { text, model_id: "eleven_turbo_v2_5" },
            { headers: { 'xi-api-key': ELEVENLABS_KEY } }
        );

        const audioBuffer = Buffer.from(response.data.audio_base64, 'base64');
        fs.writeFileSync(destAudio, audioBuffer);

        const alignment = response.data.alignment;
        const karaokeFileName = `scene_${sceneIndex}_karaoke.json`;
        const destAlign = path.join(destDir, karaokeFileName);
        fs.writeFileSync(destAlign, JSON.stringify(alignment, null, 2));

        const audioFileName = `scene_${sceneIndex}_voice.mp3`;
        console.log(`[ElevenLabs] Đã bóc băng Karaoke cho Cảnh ${sceneIndex}`);
        return {
            audioPath: `${MICRO_SERVER_URL}/ticket-assets/${audioFileName}`,
            karaokePath: `${MICRO_SERVER_URL}/ticket-assets/${karaokeFileName}`,
            absoluteAudioPath: destAudio
        };
    } catch (err) {
        console.error(`[ElevenLabs Lỗi]`, err.response?.data || err.message);
    }
    return null;
}

/**
 * 👨‍💼 3. HEYGEN API: MC Ảo
 */
async function getHeyGenAvatar(text, sceneIndex, destDir) {
    if (!HEYGEN_KEY || !text) return console.log(`[HeyGen] Thiếu KEY/Text tại Cảnh ${sceneIndex}`);

    console.log(`[HeyGen] Gọi MC Ảo cho Cảnh ${sceneIndex}...`);
    try {
        const genRes = await axios.post(
            'https://api.heygen.com/v2/video/generate',
            {
                video_inputs: [{
                    character: { type: "avatar", avatar_id: "default_avatar_id", avatar_style: "normal" },
                    voice: { type: "text", input_text: text, voice_id: "default_elevenlabs_voice_map" },
                    background: { type: "color", value: "#00FF00" }
                }]
            },
            { headers: { "X-Api-Key": HEYGEN_KEY, "Content-Type": "application/json" } }
        );

        const videoId = genRes.data.data.video_id;
        let videoUrl = null;
        while (!videoUrl) {
            await new Promise(r => setTimeout(r, 10000));
            const statusRes = await axios.get(`https://api.heygen.com/v1/video_status.get?video_id=${videoId}`, {
                headers: { "X-Api-Key": HEYGEN_KEY }
            });
            const status = statusRes.data.data.status;
            if (status === "completed") {
                videoUrl = statusRes.data.data.video_url;
            } else if (status === "failed") {
                throw new Error("Render Failed in HeyGen.");
            } else {
                console.log(`[HeyGen] Cảnh ${sceneIndex} đang Render... (${status})`);
            }
        }

        const destVid = path.join(destDir, `scene_${sceneIndex}_pip.mp4`);
        await downloadFile(videoUrl, destVid);

        console.log(`[HeyGen] Thu hoạch khoai xong! Nền xanh Cảnh ${sceneIndex} đã tải về.`);
        return `file://${destVid}`;

    } catch (err) {
        console.error(`[HeyGen Lỗi]`, err.response?.data || err.message);
    }
    return null;
}

/**
 * 🎙️ 2.1. VBEE API: Ép Giọng Tiếng Việt (Batch/Async + Polling)
 */
async function getVbeeVoice(text, sceneIndex, destDir) {
    const APP_ID = process.env.VBEE_APP_ID;
    const TOKEN = process.env.VBEE_TOKEN;
    // Mặc định 2026-09-16: đổi sang mã giọng riêng của người dùng trên Vbee sau khi thử nghiệm
    // thành công ở video B/C batch "2026-09-16" — áp dụng cho MỌI video từ giờ trở đi, trừ khi
    // ghi đè qua biến môi trường VBEE_VOICE_CODE.
    const voiceCode = process.env.VBEE_VOICE_CODE || 'n_hanoi_male_kim2027_book_vc';
    if (!APP_ID || !TOKEN || !text) return console.log(`[Vbee] Thiếu APP_ID/TOKEN/Text tại Cảnh ${sceneIndex}`);

    // Dùng lại giọng đã tải sẵn nếu render lại chỉ để sửa CSS/font, tránh tốn hạn ngạch Vbee lần nữa.
    const cachedAudioName = `scene_${sceneIndex}_voice.mp3`;
    const cachedAudio = path.join(destDir, cachedAudioName);
    if (fs.existsSync(cachedAudio)) {
        console.log(`[Vbee] Đã có sẵn giọng đọc Cảnh ${sceneIndex} từ lần trước, bỏ qua gọi API lại.`);
        return {
            audioPath: `${MICRO_SERVER_URL}/ticket-assets/${cachedAudioName}`,
            karaokePath: null,
            absoluteAudioPath: cachedAudio
        };
    }

    const headers = { 'Authorization': 'Bearer ' + TOKEN, 'App-Id': APP_ID, 'Content-Type': 'application/json' };

    // QUAN TRỌNG (phát hiện 2026-09-15): khi render nhiều video liên tiếp trong cùng 1 ngày, Vbee
    // hay bị timeout ở đúng những cảnh sau cùng (nghi do rate-limit/quá tải khi gọi dồn dập) —
    // trước đây timeout là bỏ luôn cảnh đó (mất tiếng, video ngắn bất thường). Giờ thử lại tối đa
    // 2 lần, mỗi lần đợi lâu hơn (60 lần x 1.5s = 90s thay vì 45s), có nghỉ giữa các lần thử.
    const MAX_ATTEMPTS = 2;
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        console.log(`[Vbee] Dùng VoiceCode "${voiceCode}" chuyển Text thành Voice Cảnh ${sceneIndex} (lần ${attempt}/${MAX_ATTEMPTS})...`);
        try {
            const submitRes = await axios.post('https://api.vbee.vn/v1/tts', {
                text,
                voiceCode,
                mode: 'async',
                outputFormat: 'mp3',
                bitrate: 128,
                speed: 1.0,
                webhookUrl: 'https://example.com/callback'
            }, { headers });

            const requestId = submitRes.data.requestId;
            let audioLink = null;
            for (let i = 0; i < 60; i++) {
                await new Promise(r => setTimeout(r, 1500));
                const pollRes = await axios.get(`https://api.vbee.vn/v1/tts/requests/${requestId}`, { headers });
                if (pollRes.data.status === 'COMPLETED') { audioLink = pollRes.data.audioLink; break; }
                if (pollRes.data.status === 'FAILED') throw new Error(`Vbee báo FAILED cho Cảnh ${sceneIndex}`);
            }
            if (!audioLink) throw new Error(`Vbee timeout (quá 90s chưa xong) tại Cảnh ${sceneIndex}`);

            // audioLink hết hạn sau 3 phút -> tải về NGAY khi vừa nhận được
            const audioFileName = `scene_${sceneIndex}_voice.mp3`;
            const destAudio = path.join(destDir, audioFileName);
            await downloadFile(audioLink, destAudio);

            console.log(`[Vbee] Đã tải xong giọng đọc Cảnh ${sceneIndex}`);
            return {
                audioPath: `${MICRO_SERVER_URL}/ticket-assets/${audioFileName}`,
                karaokePath: null, // Vbee không trả về timestamp karaoke như ElevenLabs
                absoluteAudioPath: destAudio
            };
        } catch (err) {
            console.error(`[Vbee Lỗi] (lần ${attempt}/${MAX_ATTEMPTS})`, err.response?.data || err.message);
            if (attempt < MAX_ATTEMPTS) {
                console.log(`[Vbee] Nghỉ 5s trước khi thử lại Cảnh ${sceneIndex}...`);
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    }
    return null;
}

async function getLocalMusic() {
    const musicDir = path.join(__dirname, '..', '..', 'media-input', 'background-music');
    if (!fs.existsSync(musicDir)) return null;

    const files = fs.readdirSync(musicDir).filter(f => !f.startsWith('.') && (f.toLowerCase().endsWith('.mp3') || f.toLowerCase().endsWith('.wav') || f.toLowerCase().endsWith('.m4a')));
    if (files.length === 0) return null;

    const randomFile = files[Math.floor(Math.random() * files.length)];

    console.log(`[Music] Đã nạp nhạc nền Local: ${randomFile}`);
    return `${MICRO_SERVER_URL}/media-input/background-music/${encodeURIComponent(randomFile)}`;
}

module.exports = {
    getPexelsBroll,
    getPexelsPhoto,
    getLocalBroll,
    getElevenLabsVoice,
    getVbeeVoice,
    getHeyGenAvatar,
    getLocalMusic
};
