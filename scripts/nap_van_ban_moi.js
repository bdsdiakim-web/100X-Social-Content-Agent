// Nạp văn bản pháp luật mới vào kho tra cứu.
//   Văn bản thường (Hà Nội/Trung ương):
//     node scripts/nap_van_ban_moi.js "D:\duong\dan\file.txt" ten_chuan_khong_dau.txt
//   Văn bản của tỉnh/thành khác:
//     node scripts/nap_van_ban_moi.js "D:\duong\dan\file.txt" ten_file.txt --tinh "Ten Tinh"
// Việc script làm: kiểm tra tồn tại/không ghi đè, copy vào đúng chỗ, in 15 dòng đầu để xác minh,
// ghi 1 dòng "CHỜ GẮN" vào PHẦN E của INDEX.md, dựng lại cây tỉnh nếu là văn bản tỉnh.
// Script KHÔNG tự gắn vào PHẦN A/B (cần người/AI đọc nội dung) — dòng "CHỜ GẮN" nhắc việc đó.
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const args = process.argv.slice(2);
const ti = args.indexOf('--tinh');
const tinh = ti >= 0 ? args.splice(ti, 2)[1] : null;
const [src, name] = args;
if (!src || !name) {
  console.error('Cách dùng: node scripts/nap_van_ban_moi.js "<file nguồn>" <ten_chuan.txt> [--tinh "Ten Tinh"]');
  process.exit(1);
}
if (!fs.existsSync(src)) { console.error('Không thấy file nguồn:', src); process.exit(1); }
if (!/\.(txt|md|docx|json)$/i.test(name)) { console.error('Tên đích phải có đuôi .txt/.md/.docx/.json'); process.exit(1); }

const kho = path.join(__dirname, '..', 'database', 'legal_sources');
const destDir = tinh ? path.join(kho, 'tinh_thanh', 'van_ban_txt', tinh) : kho;
const dest = path.join(destDir, name);
if (fs.existsSync(dest)) { console.error('Đã có file này, không ghi đè:', dest); process.exit(1); }

fs.mkdirSync(destDir, { recursive: true });
fs.copyFileSync(src, dest);
console.log('Đã copy →', path.relative(path.join(__dirname, '..'), dest));

if (/\.(txt|md)$/i.test(name)) {
  const head = fs.readFileSync(dest, 'utf8').split(/\r?\n/).filter(l => l.trim()).slice(0, 15);
  console.log('--- 15 dòng đầu (xác minh cơ quan ban hành / số / ngày, KHÔNG tin tên file) ---');
  console.log(head.join('\n'));
}

const idx = path.join(kho, 'INDEX.md');
const today = new Date().toISOString().slice(0, 10);
const where = tinh ? 'tinh_thanh/van_ban_txt/' + tinh + '/' + name : name;
fs.appendFileSync(idx, '- ' + today + ': nạp `' + where + '` — CHỜ GẮN vào PHẦN A/B (xem PHẦN D bước 4) sau khi xác minh nội dung.\n');
console.log('Đã ghi dòng CHỜ GẮN vào INDEX.md (PHẦN E).');

if (tinh) execFileSync(process.execPath, [path.join(__dirname, 'build_cay_tinh.js')], { stdio: 'inherit' });
console.log('Xong. Việc còn lại: xác minh nội dung → gắn PHẦN A/B → git commit database/legal_sources/.');
