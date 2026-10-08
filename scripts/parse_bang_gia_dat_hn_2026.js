/* Đọc bảng giá đất Hà Nội 2026 (bản .txt xuất từ Word: ô bảng ngăn bằng \r) thành JSON có cấu trúc.
   Chạy: node scripts/parse_bang_gia_dat_hn_2026.js "<file .txt>" <thư mục ra>
   Ra: bang_gia_dat_hn_2026.json (dữ liệu) và bang_gia_dat_hn_2026_kiemtra.txt (báo cáo kiểm tra).
   Cách đọc: tìm từng cụm 12 ô giá (đất ở, TMDV, SXKD × VT1–VT4), lấy các ô chữ đứng trước cụm làm
   số thứ tự, tên đường, đoạn từ – đến (hoặc mặt cắt đường với khu đô thị). */
const fs = require("fs"), path = require("path");
const [, , SRC, OUT = "database/legal_sources"] = process.argv;
const raw = fs.readFileSync(SRC, "utf8").replace(/^﻿/, "").replace(/\r\n/g, "\n");
const fixU = (raw.match(/[ƣƢ]/g) || []).length;
const t = raw.replace(/ƣ/g, "ư").replace(/Ƣ/g, "Ư").normalize("NFC");
const clean = s => s.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
const cells = t.split("\r").map(clean);

const PRICE = /^\d{1,3}( \d{3})*$/;
const TT = /^([IVX]{1,5}|\d{1,4}(\.\d{1,3})*|-)\.?$/;
const MATCAT = /^\d+([,.]\d+)?\s*m(\s*-\s*\d+([,.]\d+)?\s*m)?$|^(trên|dưới|từ)\s+\d|^Đường (từ |dưới |trên )?\d|^Mặt cắt/i;
const HEADER = /^(TT|Stt|Tên đường phố|Đoạn đường|Giá đất ở|Giá đất thương mại, dịch vụ|Giá đất sản xuất kinh doanh.*|dịch vụ|Từ|Đến|VT[1-4])$/;
const isP = c => PRICE.test(c);
const num = c => c ? +c.replace(/ /g, "") * 1000 : null; // đơn vị bảng: 1000 đ/m²

/* Tách phụ lục */
const sections = [];
cells.forEach((c, i) => {
  const m = c.match(/L[ỤU]C S[ỐO] (5\.\d+)/); if (!m) return;
  const head = [c, cells[i + 1] || "", cells[i + 2] || ""].join(" ");
  const kv = head.match(/KHU V[ỰU]C (\d+)/), w = head.match(/\(Cho các ([^)]*)\)/);
  sections.push({phuluc: m[1], start: i, khuvuc: kv ? +kv[1] : null,
    apDung: w ? w[1].split(/,\s*/).map(x => x.replace(/^(các )?(phường|xã)\s+/i, "").trim()).filter(Boolean) : [],
    loaiApDung: w ? (/xã/.test(w[1]) && /phường/.test(w[1]) ? "phường, xã" : /xã/.test(w[1]) ? "xã" : "phường") : "", rows: [], groups: []});
});
sections.forEach((s, k) => s.end = k + 1 < sections.length ? sections[k + 1].start : cells.length);

const issues = [];
sections.filter(s => s.phuluc !== "5.18").forEach(s => {
  let p = s.start + 1, prevEnd = s.start + 1, lastName = "", group = "", cat = "";
  while (p < s.end){
    const blk = cells.slice(p, p + 12);
    let isBlock = isP(cells[p]) && !isP(cells[p - 1] || "") && blk.length === 12 && blk.every(x => x === "" || isP(x)) && blk.filter(isP).length >= 2;
    // Dòng không có giá đất ở (ví dụ Khu công nghệ cao Hòa Lạc): ô chữ, rồi 4 ô đất ở trống, rồi giá TMDV/SXKD
    if (!isBlock && cells[p] === "" && cells[p - 1] && !isP(cells[p - 1]) && !HEADER.test(cells[p - 1]) && blk.length === 12 && blk.every(x => x === "" || isP(x)) &&
        blk.slice(0, 4).every(x => x === "") && blk.slice(4).some(isP) && !isP(cells[p + 12] || "")) isBlock = true;
    if (!isBlock){ p++; continue; }
    // Các ô chữ trước cụm giá
    let txt = cells.slice(prevEnd, p);
    let lastHead = -1; txt.forEach((x, k) => { if (HEADER.test(x) || /L[ỤU]C S[ỐO]/.test(x) || /^Đơn vị tính/.test(x)) lastHead = k; });
    txt = txt.slice(lastHead + 1);
    // Dòng nhóm phía trước (không có giá): "I", "Quốc lộ", "1", "Quốc lộ 23 và Đường 23B:", "KHU ĐÔ THỊ"…
    let ttIdx = -1; txt.forEach((x, k) => { if (x && TT.test(x)) ttIdx = k; });
    const before = ttIdx > 0 ? txt.slice(0, ttIdx) : [];
    const ne = before.filter(x => x && !TT.test(x));
    if (ne.length){
      before.forEach((x, k) => { if (/^[IVX]+$/.test(x)){ const nm = before.slice(k + 1).find(y => y && !TT.test(y)); if (nm){ cat = nm; s.groups.push({tt: x, name: nm, loai: "nhóm lớn"}); } } });
      const g = ne[ne.length - 1].replace(/:$/, "");
      if (g !== cat){ group = g; s.groups.push({tt: "", name: g, loai: "nhóm"}); } else group = "";
    }
    const rowTxt = ttIdx >= 0 ? txt.slice(ttIdx) : ["", ...txt.slice(Math.max(0, txt.length - 4))];
    const tt = rowTxt[0] || "", rest = rowTxt.slice(1);
    let name = rest[0] || "", seg = rest.slice(1).filter(Boolean);
    if (!name && rest.filter(Boolean).length && ttIdx < 0){ seg = rest.filter(Boolean); }
    if (!name) name = lastName; else lastName = name;
    name = name.replace(/^-\s*/, "");
    const pr = cells.slice(p, p + 12), v = pr.map(num);
    const row = {tt, ten: name, tu: MATCAT.test(seg[0] || "") ? "" : (seg[0] || ""), den: MATCAT.test(seg[0] || "") ? "" : (seg[1] || ""), matCat: MATCAT.test(seg[0] || "") ? seg[0] : "",
      nhom: tt.includes(".") || tt === "-" ? group : "", nhomLon: cat, o: v.slice(0, 4), tmdv: v.slice(4, 8), sxkd: v.slice(8, 12)};
    if (!row.ten) issues.push(`[${s.phuluc}] ô ${p}: không xác định được tên đường`);
    [["đất ở", row.o], ["TMDV", row.tmdv], ["SXKD", row.sxkd]].forEach(([n, a]) => {
      for (let k = 1; k < 4; k++) if (a[k] != null && a[k - 1] != null && a[k] > a[k - 1]) issues.push(`[${s.phuluc}] TT ${tt} ${row.ten}${row.tu ? " (" + row.tu + " → " + row.den + ")" : ""}${row.matCat ? " mặt cắt " + row.matCat : ""}: ${n} VT${k + 1} = ${a[k] / 1000} cao hơn VT${k} = ${a[k - 1] / 1000}`);
    });
    if (row.o[0] && row.tmdv[0] && row.tmdv[0] > row.o[0]) issues.push(`[${s.phuluc}] TT ${tt} ${row.ten}: giá TMDV VT1 (${row.tmdv[0] / 1000}) cao hơn giá đất ở VT1 (${row.o[0] / 1000})`);
    s.rows.push(row);
    p += 12; prevEnd = p;
  }
  // Ô chữ còn sót sau cụm giá cuối cùng (ngoài tiêu đề) để kiểm tra
  const tail = cells.slice(prevEnd, s.end).filter(x => x && !HEADER.test(x) && !/L[ỤU]C S[ỐO]|^Đơn vị/.test(x) && !TT.test(x));
  if (tail.length) issues.push(`[${s.phuluc}] cuối phụ lục còn ${tail.length} ô chữ không có giá: ${tail.slice(0, 3).map(x => '"' + x.slice(0, 60) + '"').join(", ")}`);
});

/* Phụ lục 5.18: đất nông nghiệp (đơn vị đồng/m²). Ô gộp theo chiều dọc để trống → lấy giá dòng trên. */
const agri = [];
{
  const s = sections.find(x => x.phuluc === "5.18"), rest = cells.slice(s.start + 1, s.end);
  const VND = /^\d{1,3}(\.\d{3})+$/;
  let k = rest.findIndex(c => /Giá đất rừng/.test(c)) + 1, kv = "", prev = null;
  while (k < rest.length){
    if (/^\d+$/.test(rest[k]) && /^Khu vực \d+/.test(rest[k + 1] || "")){ kv = rest[k + 1]; k += 2; continue; }
    if (!/^Các (phường|xã)/.test(rest[k] || "")){ k++; continue; }
    const area = rest[k], vung = rest[k + 1], p = rest.slice(k + 2, k + 6);
    let vals = p.map(x => VND.test(x) ? +x.replace(/\./g, "") : null), ke = false;
    if (!vung && vals.every(x => x == null) && prev){ vals = prev.vals; ke = true; }
    agri.push({khuvuc: kv, apDung: area.replace(/^Các (phường|xã)\s*/, "").split(/,\s*/).map(x => x.trim()).filter(Boolean), loai: /^Các xã/.test(area) ? "xã" : "phường",
      vung: vung || (prev ? prev.vung : ""), lua: vals[0], launam: vals[1], thuysan: vals[2], rung: vals[3], keThuaOGop: ke});
    prev = {vals, vung: vung || (prev ? prev.vung : "")};
    k += 6;
  }
}

const out = {nguon: "Quy định giá các loại đất trên địa bàn TP Hà Nội áp dụng 01/01/2026–31/12/2026 (ban hành kèm NQ 52/2025/NQ-HĐND)", donVi: "đồng/m²",
  ghiChu: "o / tmdv / sxkd = giá đất ở / thương mại, dịch vụ / sản xuất kinh doanh phi nông nghiệp; mỗi mảng 4 vị trí VT1–VT4 (null = bảng để trống). VT1 mặt đường có tên; VT2 ngõ mặt cắt ≥3,5 m; VT3 ngõ 2–3,5 m; VT4 ngõ <2 m. Khu đô thị: tính theo mặt cắt đường (matCat), thường chỉ có VT1–VT2.",
  taoLuc: new Date().toISOString(),
  khuVuc: sections.filter(s => s.phuluc !== "5.18").map(s => ({phuluc: s.phuluc, khuvuc: s.khuvuc, apDung: s.apDung, loaiApDung: s.loaiApDung, soDong: s.rows.length, nhom: s.groups, dong: s.rows})),
  nongNghiep: agri};
fs.writeFileSync(path.join(OUT, "bang_gia_dat_hn_2026.json"), JSON.stringify(out));
const rep = ["KIỂM TRA BẢNG GIÁ ĐẤT HÀ NỘI 2026", "Nguồn: " + SRC, "Tạo lúc: " + out.taoLuc, `Đã sửa ${fixU} ký tự "ƣ/Ƣ" (lỗi font) thành "ư/Ư".`, ""];
out.khuVuc.forEach(s => rep.push(`Phụ lục ${s.phuluc} · Khu vực ${s.khuvuc} · ${s.soDong} dòng giá (${s.dong.filter(r => r.matCat).length} dòng khu đô thị theo mặt cắt) · áp dụng ${s.loaiApDung}: ${s.apDung.join(", ")}`));
rep.push(`Phụ lục 5.18 · đất nông nghiệp · ${agri.length} dòng (${agri.filter(x => x.keThuaOGop).length} dòng lấy giá từ ô gộp phía trên)`);
rep.push("", `Tổng: ${out.khuVuc.reduce((a, s) => a + s.soDong, 0)} dòng giá đất phi nông nghiệp.`, "", `CÁC ĐIỂM CẦN XEM (${issues.length}):`);
issues.forEach(x => rep.push("- " + x));
fs.writeFileSync(path.join(OUT, "bang_gia_dat_hn_2026_kiemtra.txt"), rep.join("\n"));
console.log(rep.join("\n").slice(0, 6000));
