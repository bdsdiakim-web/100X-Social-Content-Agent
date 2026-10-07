/* Hàm dùng chung cho trang khách hàng (index.html) và trang quản lý (admin.html) */

const SVC = Object.fromEntries(SERVICES.map(s => [s.no, s]));
const COMBO = Object.fromEntries(COMBOS.map(c => [c.id, c]));
const DOC_STATE = {co:"Đã có", nop:"Đã cung cấp", chua:"Chưa có", ko:"Không áp dụng"};
const LOCAL_KEY = "hoso_demo_v1";
const OFFICE = Object.fromEntries(OFFICES.map(o => [o.id, o]));
const PARTNER_NAMES = OFFICES.filter(o => o.type !== "vmp").map(o => o.name);

/* ---------- Luật sư và thanh toán ---------- */
const LAWYER = Object.fromEntries(LAWYERS.map(l => [l.id, l]));
const PAY_STATES = ["Chưa thanh toán", "Đã chuyển, chờ xác nhận", "Đã nhận đặt cọc", "Đã thanh toán đủ", "Hoàn tiền"];
(function lawyerRange(){
  const ps = LAWYERS.flatMap(l => l.packages.map(p => p.price)).filter(p => p != null);
  PRICE[18] = ps.length ? {min: Math.min(...ps), max: Math.max(...ps)} : {min: null, max: null};
})();
function lawyerPkg(r){
  const l = r && r.lawyer ? LAWYER[r.lawyer] : null;
  const p = l && r.lawyerPkg !== "" && r.lawyerPkg != null ? l.packages[Number(r.lawyerPkg)] : null;
  return {l, p};
}
function lawyerText(r){
  const {l, p} = lawyerPkg(r);
  if (!l) return "";
  return `${l.name} (${l.org})${p ? " · " + p.name + " · " + (p.price != null ? money(p.price) : "giá liên hệ") : ""}`;
}
const bankReady = () => BANK.account && !/^\[/.test(BANK.account);
function transferContent(r){
  return BANK.syntax.replace("{ma}", String(r.id || "").replace(/[^A-Za-z0-9]/g, "")).replace("{sdt}", String(r.phone || "").replace(/\D/g, ""));
}
/* Số tiền cần chuyển khi đăng ký: phí gói luật sư đã chọn + tiền giữ lịch (nếu anh đặt) */
function payAmount(r){
  const {p} = lawyerPkg(r);
  const law = (r.services || []).includes(18) && p && p.price != null ? p.price : 0;
  const dep = (r.services || []).some(no => no !== 18) && BANK.deposit ? BANK.deposit : 0;
  return law + dep || null;
}
function qrUrl(r){
  if (!bankReady() || !BANK.bankId) return "";
  const amt = payAmount(r);
  return `https://img.vietqr.io/image/${encodeURIComponent(BANK.bankId)}-${encodeURIComponent(BANK.account.replace(/\s/g, ""))}-compact2.png?` +
    (amt ? "amount=" + amt + "&" : "") + (r.id ? "addInfo=" + encodeURIComponent(transferContent(r)) + "&" : "") + "accountName=" + encodeURIComponent(BANK.holder.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "D").toUpperCase());
}

/* Khoảng cách đường chim bay (km) */
function distKm(a, b){
  if (a == null || b == null || a.lat == null || b.lat == null) return null;
  const R = 6371, r = x => x * Math.PI / 180;
  const dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function mapLink(o){
  const q = o.lat != null ? o.lat + "," + o.lng : [o.name, o.address, o.province].join(", ");
  return "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
}
function officeText(o){ return o ? `${o.name} — ${o.address}, ${o.province}${o.phone ? " — ĐT " + o.phone : ""}` : ""; }
function visitText(r){
  if (!r.visit) return "Chưa chọn";
  let t = VISIT[r.visit] || r.visit;
  if (r.visit === "office") t += r.office && OFFICE[r.office] ? ": " + officeText(OFFICE[r.office]) : ": chưa chọn văn phòng" + (r.officeProvince ? " tại " + r.officeProvince : "");
  if (r.visitTime) t += " · muốn đến lúc " + new Date(r.visitTime).toLocaleString("vi-VN", {weekday:"short", day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit"});
  return t;
}

const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const pad2 = n => String(n).padStart(2, "0");
const money = n => n == null ? null : Math.round(n).toLocaleString("vi-VN") + " đ";

function priceText(min, max){
  if (min == null && max == null) return "Liên hệ";
  if (min != null && max != null && min !== max) return money(min) + " – " + money(max);
  return "Từ " + money(min ?? max);
}
const daysText = d => d ? (d[0] === d[1] ? d[0] + " ngày" : d[0] + "–" + d[1] + " ngày") : "—";

/* Gộp giấy tờ của nhiều dịch vụ, bỏ trùng; giấy tờ bắt buộc ở bất kỳ dịch vụ nào thì tính là bắt buộc */
function mergedDocs(svcNos){
  const map = new Map();
  svcNos.forEach(no => (SVC[no]?.docs || []).forEach(([id, need, note]) => {
    const cur = map.get(id) || {id, ...DOCS[id], need: 2, notes: [], services: []};
    cur.need = Math.min(cur.need, need);
    if (note) cur.notes.push(note);
    cur.services.push(no);
    map.set(id, cur);
  }));
  return [...map.values()].sort((a, b) => a.need - b.need);
}

/* Tính giá, thời gian, giấy tờ còn thiếu cho một hồ sơ */
function evaluate(r){
  const svcs = r.services || [];
  const combo = r.combo ? COMBO[r.combo] : null;
  const docs = mergedDocs(svcs).map(d => ({...d, state: (r.docs || {})[d.id] || ""}))
    .concat(typeof peopleDocs === "function" ? peopleDocs(r) : []);

  const required = docs.filter(d => d.need === 1);
  const ready = required.filter(d => d.state === "co" || d.state === "nop");
  const missing = docs.filter(d => d.state === "chua" && d.need === 1);
  const toCheck = docs.filter(d => (d.state === "chua" && d.need === 2) || (!d.state && d.need === 1));
  const provided = docs.filter(d => d.state === "nop");
  const have = docs.filter(d => d.state === "co");

  let min = 0, max = 0, priced = true;
  svcs.forEach(no => {
    if (combo && combo.free === no) return;
    const lp = no === 18 ? lawyerPkg(r).p : null;
    const p = lp && lp.price != null ? {min: lp.price, max: lp.price} : (PRICE[no] || {});
    if (p.min == null && p.max == null){ priced = false; return; }
    min += p.min ?? p.max; max += p.max ?? p.min;
  });
  if (combo && combo.discount){ min *= 1 - combo.discount / 100; max *= 1 - combo.discount / 100; }

  const dmin = svcs.length ? Math.max(...svcs.map(no => SVC[no].days[0])) : 0;
  /* Các việc làm song song một phần: lấy việc lâu nhất, cộng thêm thời gian tối thiểu của các việc còn lại */
  const longest = svcs.length ? svcs.reduce((a, b) => SVC[b].days[1] > SVC[a].days[1] ? b : a) : null;
  const dmax = svcs.length ? SVC[longest].days[1] + svcs.filter(no => no !== longest).reduce((s, no) => s + SVC[no].days[0], 0) : 0;

  return {
    docs, required, ready, missing, toCheck, provided, have, combo,
    price: {min: priced && svcs.length ? min : null, max: priced && svcs.length ? max : null, partial: !priced},
    days: svcs.length ? [dmin, dmax] : null,
    percent: required.length ? Math.round(ready.length / required.length * 100) : 0
  };
}

function newId(){
  const d = new Date();
  return "HS" + String(d.getFullYear()).slice(2) + pad2(d.getMonth() + 1) + pad2(d.getDate()) + "-" + Math.floor(1000 + Math.random() * 9000);
}

/* Lưu / đọc hồ sơ: có ENDPOINT thì gọi Google Apps Script, không thì lưu trên trình duyệt (chạy thử) */
async function api(action, payload){
  if (CONFIG.ENDPOINT){
    const res = await fetch(CONFIG.ENDPOINT, {method:"POST", headers:{"Content-Type":"text/plain;charset=utf-8"}, body: JSON.stringify({action, ...payload})});
    const out = await res.json();
    if (!out.ok) throw new Error(out.error || "Máy chủ báo lỗi");
    return out;
  }
  let all = [];
  try { all = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]"); } catch(e){}
  if (action === "submit"){ all.unshift(payload.record); }
  if (action === "update"){ all = all.map(x => x.id === payload.record.id ? payload.record : x); }
  try { localStorage.setItem(LOCAL_KEY, JSON.stringify(all)); } catch(e){}
  return {ok:true, records: all, role:"admin", name:"Chạy thử"};
}

/* Tạo phiếu hồ sơ dạng Word (.doc) — dùng cho khách, cho anh, và gửi đơn vị đối tác.
   onlySvc: chỉ xuất một dịch vụ (phiếu chuyển cho đối tác) */
function buildSheet(r, onlySvc, audience){
  const svcs = onlySvc ? [onlySvc] : r.services;
  const sub = {...r, services: svcs, allServices: r.services, combo: onlySvc ? null : r.combo};
  const ev = evaluate(sub);
  const title = audience === "partner" ? "PHIẾU CHUYỂN HỒ SƠ DỊCH VỤ" : "PHIẾU HỒ SƠ DỊCH VỤ";
  const cell = "border:1px solid #999;padding:6px;vertical-align:top;";
  const th = cell + "background:#E1EEE8;font-weight:bold;";
  const row = (k, v) => `<tr><td style="${th}width:32%">${k}</td><td style="${cell}">${v || "—"}</td></tr>`;

  const detailRows = svcs.map(no => {
    const s = SVC[no], det = (r.details || {})[no] || {};
    const lines = s.fields.map(([id, label]) => det[id] ? `${esc(label)}: <b>${esc(det[id])}</b>` : "").filter(Boolean).join("<br>");
    return `<tr><td style="${cell}">${pad2(no)}. ${esc(s.title)}</td><td style="${cell}">${lines || "—"}</td><td style="${cell}">${daysText(s.days)}</td><td style="${cell}">${esc(priceText(PRICE[no]?.min, PRICE[no]?.max))}</td></tr>`;
  }).join("");

  const docRows = ev.docs.map((d, i) => {
    const st = DOC_STATE[d.state] || "Chưa trả lời";
    const color = d.state === "chua" ? "#B8322A" : d.state === "nop" ? "#0F5A48" : "#333";
    const note = d.state === "chua" || !d.state ? `${d.reason ? `<b style="color:#B8322A">Vì sao thiếu:</b> ${esc(d.reason)}<br>` : ""}<b>Lý do cần:</b> ${esc(d.why)}<br><b>Cách bổ sung:</b> ${esc(d.where)}` : esc(d.notes.join("; "));
    return `<tr><td style="${cell}">${i + 1}</td><td style="${cell}">${esc(d.name)}${d.notes.length ? `<br><i>${esc(d.notes.join("; "))}</i>` : ""}</td><td style="${cell}">${d.need === 1 ? "Bắt buộc" : "Tùy trường hợp"}</td><td style="${cell}color:${color};font-weight:bold">${st}</td><td style="${cell}">${note}</td></tr>`;
  }).join("");

  const missList = ev.missing.length
    ? "<ol>" + ev.missing.map(d => `<li><b>${esc(d.name)}</b>${d.reason ? ` <span style="color:#B8322A">(${esc(d.reason)})</span>` : ""} — ${esc(d.why)} <i>Cách bổ sung: ${esc(d.where)}</i></li>`).join("") + "</ol>"
    : "<p>Không còn giấy tờ bắt buộc nào bị thiếu.</p>";

  return `<html><head><meta charset="utf-8"><title>${esc(r.id)}</title></head>
<body style="font-family:'Times New Roman',serif;font-size:13pt">
<p style="margin:0"><b>${esc(CONFIG.BRAND)}</b> · Hotline: ${esc(CONFIG.PHONE)} – ${esc(CONFIG.PHONE2)} · ${esc(CONFIG.EMAIL)}</p>
<h2 style="text-align:center;margin:12pt 0 2pt">${title}</h2>
<p style="text-align:center;margin:0">Mã hồ sơ: <b>${esc(r.id)}</b> · Ngày tạo: ${esc(r.created)}${r.partner && audience === "partner" ? " · Chuyển cho: <b>" + esc(r.partner) + "</b>" : ""}</p>
<h3>1. Thông tin khách hàng</h3>
<table style="border-collapse:collapse;width:100%">
${row("Họ và tên", esc(r.name))}${row("Số điện thoại", esc(r.phone))}${row("Email", esc(r.email))}
${row("Địa chỉ nhà đất", esc([r.address, r.ward, r.province].filter(Boolean).join(", ")))}
${row("Cách nộp hồ sơ", esc(visitText(r)))}
${r.lawyer ? row("Luật sư khách chọn", esc(lawyerText(r))) : ""}
${row("Thanh toán", esc(r.payStatus || "Chưa thanh toán") + (payAmount(r) ? " · cần chuyển " + money(payAmount(r)) : "") + "<br>Nội dung chuyển khoản: <b>" + esc(transferContent(r)) + "</b>" + (bankReady() ? "<br>" + esc(BANK.bankName) + " · STK " + esc(BANK.account) + " · " + esc(BANK.holder) : ""))}
${row("Gói dịch vụ", ev.combo ? esc(ev.combo.name) + " — " + esc(ev.combo.gift) : "Không chọn gói")}
${row("Yêu cầu của khách", esc(r.note))}
${row("Lịch hẹn", esc(r.appt))}${row("Trạng thái", esc(r.status))}
</table>
<h3>2. Dịch vụ yêu cầu</h3>
<table style="border-collapse:collapse;width:100%"><tr><td style="${th}">Dịch vụ</td><td style="${th}">Thông tin chi tiết khách cung cấp</td><td style="${th}">Thời gian dự kiến</td><td style="${th}">Phí dịch vụ dự kiến</td></tr>${detailRows}</table>
<h3>3. Tình trạng giấy tờ (đủ ${ev.ready.length}/${ev.required.length} giấy tờ bắt buộc)</h3>
<table style="border-collapse:collapse;width:100%"><tr><td style="${th}">#</td><td style="${th}">Giấy tờ</td><td style="${th}">Mức độ</td><td style="${th}">Tình trạng</td><td style="${th}">Lý do, giải thích</td></tr>${docRows}</table>
<h3>4. Giấy tờ còn thiếu cần bổ sung</h3>${missList}
${svcs.includes(1) && r.family && typeof famAnalyze === "function" ? `<h3>Sơ đồ thừa kế</h3>${famSheetHtml(r.family)}` : ""}
${typeof partyViewHtml === "function" && partyViewHtml(sub) ? `<h3>Người liên quan</h3>${partyViewHtml(sub).replace(/<th>/g, `<th style="${th}">`).replace(/<td>/g, `<td style="${cell}">`).replace(/<td class="mono">/g, `<td style="${cell}">`)}` : ""}
<h3>5. Dự kiến</h3>
<p>Phí dịch vụ dự kiến: <b>${esc(priceText(ev.price.min, ev.price.max))}</b>${ev.price.partial ? " (một số dịch vụ chưa có giá, sẽ báo sau)" : ""}<br>
Thời gian dự kiến: <b>${daysText(ev.days)}</b>, tính từ khi đủ giấy tờ.<br>
Chưa bao gồm: ${esc([...new Set(svcs.map(no => SVC[no].extra))].join("; "))}.</p>
${r.staffNote && audience !== "customer" ? `<h3>6. Ghi chú nội bộ</h3><p>${esc(r.staffNote)}</p>` : ""}
<p style="font-size:10pt;color:#555;margin-top:18pt">Danh sách giấy tờ mang tính tham khảo, sẽ được xác nhận lại theo từng hồ sơ cụ thể.</p>
</body></html>`;
}

/* Lưu file: trong bản xem thử trên claude.ai dùng quyền "downloads" (phiếu .doc lưu thành .html, mở được bằng Word);
   trên web thật (Netlify) tải xuống trực tiếp */
async function saveFile(filename, content, mime){
  if (window.claude && window.claude.use){
    let dl = null;
    try { dl = await window.claude.use("downloads"); } catch(e){}
    if (dl){
      try { await dl.save({filename: filename.replace(/\.doc$/, ".html"), data: "﻿" + content}); return true; }
      catch(e){ return false; }
    }
  }
  try {
    const blob = new Blob(["﻿", content], {type: mime});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    return true;
  } catch(e){ return false; }
}
const slug = s => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").replace(/[^A-Za-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* Tin nhắn Zalo hướng dẫn khách bổ sung giấy tờ */
function zaloText(r){
  const ev = evaluate(r);
  let t = `Chào anh/chị ${r.name}, ${CONFIG.BRAND} gửi tình trạng hồ sơ ${r.id}:\n`;
  t += `Dịch vụ: ${r.services.map(no => SVC[no].title).join(", ")}\n`;
  t += `Giấy tờ bắt buộc đã đủ: ${ev.ready.length}/${ev.required.length}\n`;
  if (ev.missing.length){
    t += `Cần bổ sung:\n` + ev.missing.map((d, i) => `${i + 1}. ${d.name}${d.reason ? " (" + d.reason + ")" : ""}: ${d.where}`).join("\n") + "\n";
  }
  t += `Phí dịch vụ dự kiến: ${priceText(ev.price.min, ev.price.max)}\nThời gian dự kiến: ${daysText(ev.days)} kể từ khi đủ giấy tờ.`;
  if (r.visit === "office" && r.office && OFFICE[r.office]){ const o = OFFICE[r.office]; t += `\nVăn phòng nộp hồ sơ: ${officeText(o)}\nChỉ đường: ${mapLink(o)}`; }
  if (r.lawyer) t += `\nLuật sư: ${lawyerText(r)}`;
  if (r.appt) t += `\nLịch hẹn: ${new Date(r.appt).toLocaleString("vi-VN")}`;
  if (bankReady()) t += `\nChuyển khoản: ${BANK.bankName} · STK ${BANK.account} · ${BANK.holder}${payAmount(r) ? " · số tiền " + money(payAmount(r)) : ""}\nNội dung: ${transferContent(r)}`;
  return t;
}
