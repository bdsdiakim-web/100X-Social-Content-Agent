#!/usr/bin/env node
/**
 * LIVESTREAM -> SHORTS (chay local, khong dang bai)
 *   node scripts/livestream_to_shorts.js <video> [tuy chon]
 *
 *   --n 4              so short can cat (mac dinh 4)
 *   --min 45 --max 85  do dai moi short (giay; tran 90s theo quy dinh)
 *   --model small      model Whisper: tiny|base|small|medium|large-v3-turbo
 *   --lang vi
 *   --layout crop|blur crop = cat khung doc giua (hop nguoi noi chinh); blur = giu khung ngang tren nen mo
 *   --cropx 0.5        vi tri khung crop theo chieu ngang 0..1
 *   --no-llm           chi dung diem so noi bo (0 dong, khong goi Gemini)
 *   --transcript f.json  dung san transcript (bo qua buoc Whisper)
 *   --out <thu muc>    mac dinh media_output/<ngay>/Livestream/<ten video>
 *
 * Ket qua: short_01.mp4..., highlights.json, transcript.json trong thu muc out.
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env'), quiet: true });
const fs = require('fs');
const path = require('path');
const { FFMPEG, run, probe, fmtTime } = require('./livestream_shorts/lib');
const { pickHighlights } = require('./livestream_shorts/pick_highlights');
const { wordsForClip, buildAss } = require('./livestream_shorts/make_ass');
const { cutShort } = require('./livestream_shorts/cut_shorts');

function parseArgs(argv) {
    const a = { _: [] };
    for (let i = 0; i < argv.length; i++) {
        if (!argv[i].startsWith('--')) { a._.push(argv[i]); continue; }
        const k = argv[i].slice(2);
        a[k] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
    }
    return a;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const video = args._[0];
    if (!video || !fs.existsSync(video)) {
        console.log('Dung: node scripts/livestream_to_shorts.js <video> [--n 4] [--model small] [--layout crop|blur] [--no-llm]');
        process.exit(1);
    }
    const n = +args.n || 4, minSec = +args.min || 45, maxSec = Math.min(+args.max || 85, 90);
    const model = args.model || 'small', lang = args.lang || 'vi';
    const info = probe(video);
    const day = new Date().toISOString().slice(0, 10);
    const outDir = path.resolve(args.out || path.join(__dirname, '..', 'media_output', day, 'Livestream',
        path.basename(video, path.extname(video)).replace(/[^\w.-]+/g, '_')));
    fs.mkdirSync(outDir, { recursive: true });
    console.log(`Video: ${path.basename(video)} | ${fmtTime(info.duration)} | ${info.width}x${info.height}\nThu muc ra: ${outDir}`);

    // 1) Boc bang (Whisper local)
    let tPath = args.transcript ? path.resolve(args.transcript) : path.join(outDir, 'transcript.json');
    if (fs.existsSync(tPath)) {
        console.log(`[1/3] Dung transcript co san: ${tPath}`);
    } else {
        console.log(`[1/3] Boc bang bang Whisper "${model}" (CPU, co the mat lau voi video dai)...`);
        const wav = path.join(outDir, 'audio_16k.wav');
        await run(FFMPEG, ['-y', '-i', video, '-vn', '-ac', '1', '-ar', '16000', wav]);
        await run('py', [path.join(__dirname, 'livestream_shorts', 'transcribe.py'), wav, tPath,
            '--model', model, '--lang', lang], { stdio: ['ignore', 'inherit', 'inherit'] });
        fs.rmSync(wav, { force: true });
    }
    const transcript = JSON.parse(fs.readFileSync(tPath, 'utf8'));

    // 2) Chon doan hay
    console.log('[2/3] Chon doan dat gia...');
    const { mode, items } = await pickHighlights(transcript, { n, minSec, maxSec, useLlm: !args['no-llm'] });
    console.log(`  Cach chon: ${mode}`);
    fs.writeFileSync(path.join(outDir, 'highlights.json'), JSON.stringify(items.map((c, i) => ({
        short: i + 1, start: c.start, end: c.end, dur: +c.dur.toFixed(1), title: c.title, reason: c.reason || '', score: +c.score.toFixed(2),
    })), null, 2), 'utf8');

    // 3) Cat + crop 9:16 + phu de
    console.log('[3/3] Cat va chen phu de bang FFmpeg...');
    for (let i = 0; i < items.length; i++) {
        const c = items[i];
        const out = path.join(outDir, `short_${String(i + 1).padStart(2, '0')}.mp4`);
        const ass = buildAss(wordsForClip(transcript, c.start, c.end));
        await cutShort({ video, start: c.start, end: c.end, outFile: out, assText: ass,
            layout: args.layout || 'crop', cropX: args.cropx !== undefined ? +args.cropx : 0.5, srcW: info.width, srcH: info.height });
        console.log(`  ✔ short_${String(i + 1).padStart(2, '0')}.mp4  ${fmtTime(c.start)}–${fmtTime(c.end)} (${Math.round(c.dur)}s)  "${c.title}"`);
    }
    console.log(`\nXong ${items.length} short. KHONG tu dong dang — hay xem lai roi dung lenh /publish.`);
}

main().catch((e) => { console.error('LOI:', e.message); process.exit(1); });
