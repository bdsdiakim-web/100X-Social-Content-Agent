// Dựng lại database/legal_sources/tinh_thanh/CAY_TRA_CUU.md từ nội dung thư mục.
// Chạy: node scripts/build_cay_tinh.js   (gọi tự động bởi scripts/nap_van_ban_moi.js)
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..', 'database', 'legal_sources', 'tinh_thanh');
const raw = 'D:/KHO_PHAP_LUAT_DAT_DAI/VAN_BAN_GOC';
const vb = path.join(root, 'van_ban_txt');
const qdDir = path.join(root, 'quy_dinh_vi_tri');
const jsDir = path.join(root, 'bang_gia_json');
const BT = '`';
const ls = d => (fs.existsSync(d) ? fs.readdirSync(d) : []);
const kb = f => Math.max(1, Math.round(fs.statSync(f).size / 1024)) + ' KB';

const prov = ls(vb).filter(n => fs.statSync(path.join(vb, n)).isDirectory());
const qd = new Set(ls(qdDir));
const norm = s => s.replace(/\.jsonl$/, '').replace(/ \(da co txt\)$/, '');
const jsFiles = new Map(ls(jsDir).filter(f => f.endsWith('.jsonl')).map(f => [norm(f), f]));
const all = new Set([
  ...prov,
  ...[...qd].map(f => f.replace(/\.txt$/, '')),
  ...jsFiles.keys(),
]);

const fence = BT + BT + BT;
let o = [
  '# CÂY TRA CỨU DỮ LIỆU TỈNH/THÀNH (bảng giá đất + quy định vị trí)',
  '',
  '> File này TỰ SINH bởi `node scripts/build_cay_tinh.js` — đừng sửa tay, chạy lại script khi thêm file.',
  '> Nguồn: bản copy từ D:\\KHO_PHAP_LUAT_DAT_DAI (bản gốc giữ nguyên). Hà Nội nằm ở INDEX.md, không ở đây.',
  '> Cách dùng: tìm tỉnh → mở file .txt → Grep trực tiếp trước khi trích (cùng nguyên tắc với INDEX.md).',
  '> Tên tỉnh theo tên thư mục gốc (không dấu). "(anh)" = nguồn là ảnh, đã OCR, có thể sai chữ/số → đối chiếu bản gốc.',
  '',
  '## Cấu trúc',
  fence,
  'database/legal_sources/tinh_thanh/',
  '├── van_ban_txt/<Tinh>/*.txt     văn bản bảng giá đất từng tỉnh (chuyển từ PDF/Word)',
  '├── quy_dinh_vi_tri/<Tinh>.txt   quy định xác định vị trí/khu vực của tỉnh',
  '└── bang_gia_json/<Tinh>.jsonl   dòng giá trích TỰ ĐỘNG (khu, đường, từ-đến, giá): chỉ để lọc nhanh,',
  '                                 PHẢI đối chiếu .txt/bản gốc trước khi trích số cho khách',
  fence,
  'Bản gốc PDF/Word (không có trên GitHub): D:\\KHO_PHAP_LUAT_DAT_DAI\\VAN_BAN_GOC\\<Tinh>\\',
  '',
  '## Danh mục (' + all.size + ' tỉnh/thành)',
  '',
  '| Tỉnh/thành | Văn bản txt | Quy định vị trí | Dữ liệu giá (jsonl) | Bản gốc trên D: |',
  '|---|---|---|---|---|',
].join('\n') + '\n';

for (const p of [...all].sort()) {
  const d = path.join(vb, p);
  const files = fs.existsSync(d) ? ls(d).filter(f => f.endsWith('.txt')) : [];
  const fl = files.length
    ? files.map(f => BT + 'van_ban_txt/' + p + '/' + f + BT + ' (' + kb(path.join(d, f)) + ')').join('<br>')
    : '—';
  const q = qd.has(p + '.txt') ? BT + 'quy_dinh_vi_tri/' + p + '.txt' + BT : '—';
  const j = jsFiles.has(p)
    ? BT + 'bang_gia_json/' + jsFiles.get(p) + BT + ' (' + kb(path.join(jsDir, jsFiles.get(p))) + ')'
    : '—';
  const r = fs.existsSync(raw + '/' + p) ? 'có' : '—';
  o += '| ' + p + ' | ' + fl + ' | ' + q + ' | ' + j + ' | ' + r + ' |\n';
}
fs.writeFileSync(path.join(root, 'CAY_TRA_CUU.md'), o);
console.log('CAY_TRA_CUU.md:', all.size, 'tỉnh/thành');
