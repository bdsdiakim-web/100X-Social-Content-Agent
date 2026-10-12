// Tao phu de ASS (chu to, vien den, de doc tren dien thoai) tu moc thoi gian tung chu.
const assTime = (t) => {
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = t % 60;
    return `${h}:${String(m).padStart(2, '0')}:${s.toFixed(2).padStart(5, '0')}`;
};
const esc = (s) => s.replace(/[{}\\]/g, '').replace(/\r?\n/g, ' ');

// Lay danh sach chu trong [start, end] cua clip, doi sang thoi gian tuong doi (0 = dau clip)
function wordsForClip(transcript, start, end) {
    const out = [];
    for (const seg of transcript.segments) {
        if (seg.end <= start || seg.start >= end) continue;
        let words = seg.words && seg.words.length ? seg.words : null;
        if (!words) {   // khong co moc tung chu: chia deu theo thoi gian doan
            const parts = seg.text.split(/\s+/).filter(Boolean);
            const step = (seg.end - seg.start) / Math.max(parts.length, 1);
            words = parts.map((w, i) => ({ word: w, start: seg.start + i * step, end: seg.start + (i + 1) * step }));
        }
        for (const w of words) {
            if (w.start >= start - 0.05 && w.end <= end + 0.3) {
                out.push({ word: w.word, start: Math.max(0, w.start - start), end: Math.min(end - start, w.end - start) });
            }
        }
    }
    return out;
}

function buildAss(words, { width = 1080, height = 1920, font = 'Arial', size = 80, marginV = 430, perLine = 4 } = {}) {
    const lines = [];
    let cur = [];
    const flush = () => { if (cur.length) { lines.push(cur); cur = []; } };
    for (const w of words) {
        const gap = cur.length ? w.start - cur[cur.length - 1].end : 0;
        if (cur.length >= perLine || gap > 0.7) flush();
        cur.push(w);
        if (/[.?!…]$/.test(w.word)) flush();
    }
    flush();

    const events = lines.map((ln, i) => {
        const start = ln[0].start;
        let end = ln[ln.length - 1].end + 0.12;
        const next = lines[i + 1];
        if (next) end = Math.min(end, next[0].start);
        return `Dialogue: 0,${assTime(start)},${assTime(Math.max(end, start + 0.2))},Cap,,0,0,0,,${esc(ln.map((w) => w.word).join(' '))}`;
    });

    return [
        '[Script Info]', 'ScriptType: v4.00+', `PlayResX: ${width}`, `PlayResY: ${height}`, 'WrapStyle: 2', '',
        '[V4+ Styles]',
        'Format: Name,Fontname,Fontsize,PrimaryColour,SecondaryColour,OutlineColour,BackColour,Bold,Italic,Underline,StrikeOut,ScaleX,ScaleY,Spacing,Angle,BorderStyle,Outline,Shadow,Alignment,MarginL,MarginR,MarginV,Encoding',
        `Style: Cap,${font},${size},&H00FFFFFF,&H000000FF,&H00000000,&H64000000,-1,0,0,0,100,100,0,0,1,7,2,2,60,60,${marginV},1`,
        '', '[Events]', 'Format: Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text', ...events, '',
    ].join('\n');
}

module.exports = { wordsForClip, buildAss };
