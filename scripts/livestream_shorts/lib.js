const path = require('path');
const { spawn, spawnSync } = require('child_process');
const FFMPEG = require('ffmpeg-static');

function run(cmd, args, opts = {}) {
    return new Promise((resolve, reject) => {
        const p = spawn(cmd, args, { stdio: ['ignore', 'pipe', 'pipe'], ...opts });
        let err = '';
        if (p.stderr) p.stderr.on('data', (d) => { err = (err + d).slice(-4000); });
        p.on('error', reject);
        p.on('close', (code) => {
            if (code === 0) resolve();
            else reject(new Error(`${path.basename(cmd)} thoat ma ${code}\n${err}`));
        });
    });
}

function probe(file) {
    const r = spawnSync(FFMPEG, ['-hide_banner', '-i', file], { encoding: 'utf8' });
    const err = r.stderr || '';
    const d = /Duration:\s*(\d+):(\d+):(\d+\.?\d*)/.exec(err);
    const s = /Video:.*?,\s*(\d{2,5})x(\d{2,5})/.exec(err);
    if (!d) throw new Error(`Khong doc duoc thoi luong: ${file}`);
    return {
        duration: +d[1] * 3600 + +d[2] * 60 + +d[3],
        width: s ? +s[1] : 0,
        height: s ? +s[2] : 0,
    };
}

function fmtTime(sec) {
    const s = Math.round(sec);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
    const mm = String(m).padStart(2, '0'), ss = String(x).padStart(2, '0');
    return h ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

module.exports = { FFMPEG, run, probe, fmtTime };
