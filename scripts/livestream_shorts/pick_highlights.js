// Chon cac doan "dat gia" tu transcript: loc bang diem so cuc bo (0 dong), roi (tuy chon)
// nho Gemini xep hang + dat tieu de tren danh sach rut gon rat ngan (it token).
const HOOK = ['tại sao', 'vì sao', 'đừng', 'cẩn thận', 'sai lầm', 'mất trắng', 'lừa đảo', 'bị phạt', 'bắt buộc',
    'không được', 'có được không', 'rủi ro', 'thiệt hại', 'sự thật', 'nhiều người', 'đa số', 'tuyệt đối', 'lưu ý',
    'quan trọng', 'thừa kế', 'sổ đỏ', 'sổ hồng', 'tranh chấp', 'đền bù', 'bồi thường', 'thu hồi', 'đặt cọc',
    'công chứng', 'quy hoạch', 'tách thửa', 'sang tên', 'giấy tờ', 'viết tay', 'vi bằng'];
const FILLER = ['xin chào', 'chào các bạn', 'đăng ký kênh', 'nhấn like', 'cảm ơn các bạn', 'hẹn gặp lại',
    'có nghe rõ', 'mọi người nghe', 'chờ thêm', 'vào group', 'alo alo', 'test'];
const LEGAL = /(điều\s*\d+|khoản\s*\d+|luật\s|nghị định|thông tư|nghị quyết)/g;
const NUM = /\d+([.,]\d+)?\s*(triệu|tỷ|%|năm|tháng|ngày|m2|m²)/g;

const norm = (s) => s.normalize('NFC').toLowerCase();
const count = (text, list) => list.reduce((n, k) => n + (text.split(k).length - 1), 0);
const matches = (text, re) => (text.match(re) || []).length;

function scoreWindow(segs) {
    const start = segs[0].start, end = segs[segs.length - 1].end, dur = end - start;
    const text = norm(segs.map((s) => s.text).join(' '));
    const words = text.split(/\s+/).filter(Boolean).length;
    const perMin = 60 / dur;
    const spoken = segs.reduce((a, s) => a + (s.end - s.start), 0);
    const first = norm(segs.slice(0, 2).map((s) => s.text).join(' ')).split(/\s+/).slice(0, 14).join(' ');
    return {
        start, end, dur, text: segs.map((s) => s.text).join(' '),
        score:
            2.0 * count(text, HOOK) * perMin +
            1.5 * matches(text, LEGAL) * perMin +
            0.7 * matches(text, NUM) * perMin +
            1.0 * (text.split('?').length - 1) * perMin +
            2.0 * Math.min(words / dur, 3) / 3 * 3 +      // nhip noi
            1.5 * count(first, HOOK) -                    // mo dau co "moc"
            6 * count(text, FILLER) -
            4 * (1 - spoken / dur),                       // tru diem khoang lang
    };
}

function candidates(segments, minSec, maxSec) {
    const out = [];
    for (let i = 0; i < segments.length; i++) {
        let j = i;
        while (j < segments.length && segments[j].end - segments[i].start < minSec) j++;
        if (j >= segments.length) break;
        out.push(segments.slice(i, j + 1));
        let k = j;
        while (k + 1 < segments.length && segments[k + 1].end - segments[i].start <= maxSec) k++;
        if (k > j) out.push(segments.slice(i, k + 1));
    }
    return out.filter((w) => w[w.length - 1].end - w[0].start <= maxSec);
}

function greedyPick(scored, n, gap = 5) {
    const picked = [];
    for (const c of [...scored].sort((a, b) => b.score - a.score)) {
        if (picked.every((p) => c.end + gap <= p.start || c.start >= p.end + gap)) picked.push(c);
        if (picked.length >= n) break;
    }
    return picked;
}

async function rankWithGemini(shortlist, n) {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-flash-latest',
        generationConfig: { responseMimeType: 'application/json' },
    });
    const list = shortlist.map((c, i) => `#${i} (${Math.round(c.dur)}s): ${c.text.slice(0, 700)}`).join('\n\n');
    const prompt =
        `Dưới đây là ${shortlist.length} đoạn trích từ livestream tư vấn pháp lý nhà đất của một chuyên gia.\n` +
        `Chọn ${n} đoạn ĐẮT GIÁ NHẤT để làm video ngắn (hấp dẫn ngay câu đầu, trọn một ý, có lợi ích rõ cho người xem, ` +
        `không chào hỏi/kết thúc). Với mỗi đoạn viết tiêu đề tiếng Việt ≤ 60 ký tự, đúng nội dung, KHÔNG giật tít sai sự thật.\n` +
        `Trả về JSON: [{"id": <số sau #>, "title": "...", "reason": "<1 câu>"}] sắp theo độ hay giảm dần.\n\n${list}`;
    const res = await model.generateContent(prompt);
    const arr = JSON.parse(res.response.text());
    return arr
        .filter((x) => Number.isInteger(x.id) && shortlist[x.id])
        .slice(0, n)
        .map((x) => ({ ...shortlist[x.id], title: x.title, reason: x.reason }));
}

async function pickHighlights(transcript, { n = 4, minSec = 45, maxSec = 85, useLlm = true } = {}) {
    const segs = transcript.segments.filter((s) => s.text && s.end > s.start);
    const scored = candidates(segs, minSec, maxSec).map(scoreWindow);
    if (!scored.length) throw new Error('Transcript qua ngan de cat doan nao.');

    const shortlist = greedyPick(scored, Math.max(n * 3, 8));
    let chosen = null, mode = 'diem-so';
    if (useLlm && process.env.GEMINI_API_KEY) {
        try {
            for (let attempt = 1; ; attempt++) {   // Gemini thinh thoang bao 503/429 tam thoi -> thu lai
                try {
                    chosen = await rankWithGemini(shortlist, n);
                    break;
                } catch (err) {
                    if (attempt >= 3 || !/503|429|overloaded|high demand|fetch failed/i.test(String(err.message))) throw err;
                    await new Promise((r) => setTimeout(r, attempt * 4000));
                }
            }
            mode = 'diem-so+gemini';
        } catch (e) {
            const why = [e.message, e.cause && (e.cause.code || e.cause.message)].filter(Boolean).join(' | ');
            console.log(`  (Gemini loi: ${String(why).slice(0, 260)} -> dung diem so noi bo)`);
        }
    }
    if (!chosen || !chosen.length) chosen = shortlist.slice(0, n);
    chosen = chosen.map((c, i) => ({ ...c, title: c.title || c.text.slice(0, 58).trim() + '…' }));
    return { mode, items: chosen };
}

module.exports = { pickHighlights };
