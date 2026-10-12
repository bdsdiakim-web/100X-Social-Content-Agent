// Cat 1 doan thanh video doc 1080x1920, chen phu de, chuan hoa am luong. Chay hoan toan bang FFmpeg local.
const fs = require('fs');
const path = require('path');
const { FFMPEG, run } = require('./lib');

const FONT_FILES = ['arialbd.ttf', 'arial.ttf'];   // co day du dau tieng Viet

function videoFilter(layout, cropX) {
    if (layout === 'blur') {   // giu nguyen khung ngang o giua, nen la ban phong to lam mo
        return '[0:v]split[a][b];[a]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,boxblur=25:6[bg];' +
            '[b]scale=1080:-2[fg];[bg][fg]overlay=(W-w)/2:(H-h)/2,';
    }
    // crop: lay khung 9:16 tu video ngang; cropX 0..1 = vi tri ngang cua khung (0.5 = giua)
    const x = `(iw-ih*9/16)*${Math.min(Math.max(cropX, 0), 1)}`;
    return `[0:v]crop='min(iw,ih*9/16)':ih:'${x}':0,scale=1080:1920,`;
}

async function cutShort({ video, start, end, outFile, assText, layout = 'crop', cropX = 0.5, srcW, srcH }) {
    const work = fs.mkdtempSync(path.join(require('os').tmpdir(), 'short_'));
    try {
        fs.writeFileSync(path.join(work, 'cap.ass'), assText, 'utf8');
        for (const f of FONT_FILES) {
            const src = path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts', f);
            if (fs.existsSync(src)) fs.copyFileSync(src, path.join(work, f));
        }
        const portrait = srcH > srcW;   // video nguon da doc: chi scale, khong crop
        const base = portrait ? '[0:v]scale=1080:1920,' : videoFilter(layout, cropX);
        const filter = `${base}setsar=1,subtitles=cap.ass:fontsdir=.[v]`;
        fs.mkdirSync(path.dirname(outFile), { recursive: true });
        await run(FFMPEG, [
            '-y', '-ss', String(start), '-t', String((end - start).toFixed(2)), '-i', path.resolve(video),
            '-filter_complex', filter, '-map', '[v]', '-map', '0:a:0?',
            '-af', 'loudnorm=I=-16:TP=-1.5:LRA=11',
            '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-pix_fmt', 'yuv420p',
            '-c:a', 'aac', '-ar', '44100', '-b:a', '160k', '-movflags', '+faststart',
            path.resolve(outFile),
        ], { cwd: work });
    } finally {
        fs.rmSync(work, { recursive: true, force: true });
    }
}

module.exports = { cutShort };
