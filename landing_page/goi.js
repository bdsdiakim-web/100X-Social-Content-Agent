/* Phần dùng chung của trang Hồ sơ nhà đất (hoso.html): thông tin khách, xem trước miễn phí, ưu đãi lần đầu,
   mua, mở khóa, báo cáo, mẫu Word, yêu cầu hoàn tiền, link giới thiệu, link đối tác.
   Cách tính và nội dung báo cáo nằm trên máy chủ (Google Apps Script), không ở đây. */
const $ = id => document.getElementById(id);
const LOCAL_DEV = (location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname)) && (!CONFIG.ENDPOINT || new URLSearchParams(location.search).has("dev"));
const GOI_PRICE = 199000, GOI_PROMO = 100000, GOI_DEMO = "HSDEMO01", KEEP_DAYS = 90;
const normPhone = s => { s = String(s || "").replace(/\D/g, ""); return s.startsWith("84") && s.length === 11 ? "0" + s.slice(2) : s; };
let SLOT = 0, ALL = [], MAX_HS = 3, NEWHS = false, ORDER = null, OFFER = null, ME = null, DTINFO = null, devEngine = false, TAB = "thuake", FORMS = {}, POLL = null, TICK = null, SKEW = 0;

const lsGet = k => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch(e){ return null; } };
const lsSet = (k, v) => { try { v == null ? localStorage.removeItem(k) : localStorage.setItem(k, JSON.stringify(v)); } catch(e){} };
function goiSave(key, obj){ lsSet("hs_" + key, obj); }
function goiLoad(key){ return lsGet("hs_" + key); }

/* ---------- Cách xưng hô, gọi tên khách (chỉ lưu trên máy của khách) ---------- */
const XUNG = ["anh", "chị", "cô", "chú", "bác"];
const cap = s => String(s || "").charAt(0).toUpperCase() + String(s || "").slice(1);
function nguoi(p){
  p = p || ME || {};
  const x = XUNG.includes(p.xung) ? p.xung : "anh/chị", parts = String(p.name || "").trim().split(/\s+/).filter(Boolean);
  const ten = parts.length ? cap(parts[parts.length - 1].toLowerCase()) : "", goi = ten ? x + " " + ten : x;
  return {xung: x, Xung: cap(x), ten, goi, Goi: cap(goi)};
}
const mask = p => { p = String(p || "").replace(/\D/g, ""); return p.length >= 7 ? p.slice(0, 2) + "xx xxx " + p.slice(-3) : ""; };
const buoi = () => { const h = new Date().getHours(); return h < 11 ? "buổi sáng" : h < 14 ? "buổi trưa" : h < 18 ? "buổi chiều" : "buổi tối"; };
const meReady = () => ME && ME.name && /^0\d{9}$/.test(ME.phone || "") && ME.consent;
const consentOf = () => ({consent: ME && ME.consent ? ME.consent : "", mkt: !!(ME && ME.mkt)});
function meHtml(edit){
  if (meReady() && !edit){
    const g = nguoi();
    return `<div class="me-ok"><span>Chào <b>${esc(g.goi)}</b> · ${esc(mask(ME.phone))}. Hồ sơ của ${esc(g.xung)} đang được giữ riêng tại đây.</span><button type="button" class="btn ghost small" data-me-edit="1">Sửa</button></div>`;
  }
  const m = ME || {};
  return `<div class="me"><h3>Trước tiên, bên em nên gọi anh chị thế nào?</h3>
    <div class="row2"><label class="f">Xưng hô<select id="meXung">${XUNG.map(x => `<option value="${x}"${m.xung === x ? " selected" : ""}>${cap(x)}</option>`).join("")}</select></label>
    <label class="f">Họ và tên<input id="meName" autocomplete="name" value="${esc(m.name || "")}" placeholder="Nguyễn Văn Tuấn"></label>
    <label class="f">Số điện thoại (có Zalo)<input id="mePhone" type="tel" inputmode="tel" autocomplete="tel" value="${esc(m.phone || "")}" placeholder="0912 345 678"></label></div>
    <div class="chk"><label><input type="checkbox" id="meOk"${m.consent ? " checked" : ""}><span>Tôi đồng ý cho Vua Mặt Phố dùng thông tin tôi nhập (của tôi và người thân) để lập kết luận, báo cáo và liên hệ về hồ sơ này, theo <a href="baomat.html" target="_blank" rel="noopener">Chính sách bảo mật</a>.</span></label>
      <label><input type="checkbox" id="meMkt"${m.mkt ? " checked" : ""}><span>Nhận tin chăm sóc, thông tin hữu ích về nhà đất qua Zalo, email <span class="hint">(không bắt buộc)</span></span></label></div>
    <div class="toolbar"><button type="button" class="btn" id="meGo">Lưu và bắt đầu</button><span class="muted" id="meMsg" style="font-size:.88rem">Không đưa lên đường link, không bán, không chuyển cho bên khác.</span></div></div>`;
}
function meRender(edit){
  $("meBox").innerHTML = meHtml(edit);
  const g = nguoi();
  $("lamH").textContent = meReady() ? g.Goi + " cần làm việc gì?" : "Anh chị cần làm việc gì?";
  if (meReady()){
    if (!$("bName").value) $("bName").value = ME.name;
    if (!$("bPhone").value) $("bPhone").value = ME.phone;
    if (!$("uPhone").value) $("uPhone").value = ME.phone;
  }
  goiProg();
}
function meSave(){
  const name = $("meName").value.trim(), phone = normPhone($("mePhone").value), xung = $("meXung").value;
  if (!name || !/^0\d{9}$/.test(phone)){ $("meMsg").innerHTML = `<span class="errmsg" style="display:inline-block;padding:6px 10px">Nhập họ tên và số điện thoại 10 số.</span>`; return false; }
  if (!$("meOk").checked){ $("meMsg").innerHTML = `<span class="errmsg" style="display:inline-block;padding:6px 10px">Cần tick ô đồng ý để bên em được dùng thông tin lập báo cáo cho anh chị.</span>`; return false; }
  ME = Object.assign({}, ME, {name, phone, xung, consent: (ME && ME.consent) || new Date().toISOString(), mkt: $("meMkt").checked}); lsSet("hs_me", ME);
  meRender(false); toast("Cảm ơn " + nguoi().goi + "! Giờ chọn việc cần làm bên dưới.");
  return true;
}

/* ---------- Thanh tiến độ cá nhân ---------- */
function goiProg(){
  const f = FORMS[TAB], el = $("prog");
  if (!el || !f || !f.progress) return;
  const p = f.progress(), g = nguoi(), left = Math.max(1, Math.round((p.total - p.done) * 0.6));
  el.innerHTML = `<span>${esc(meReady() ? g.Goi : "Anh chị")} đã xong ${p.done}/${p.total} bước${p.done >= p.total ? " — bấm \"Xem kết luận miễn phí\" bên dưới" : " — còn khoảng " + left + " phút"}</span><div class="tk-bar"><i style="width:${Math.round(p.done / p.total * 100)}%"></i></div>`;
}

/* ---------- Thông báo nhỏ ---------- */
function toast(t){
  const d = document.createElement("div"); d.className = "toast"; d.textContent = t; document.body.appendChild(d);
  setTimeout(() => d.remove(), 4200);
}

/* ---------- Giấy tờ: Có / Thiếu / Sai + lý do ---------- */
const DOC_MISS = ["Bị mất, cần xin lại", "Chưa từng làm giấy này", "Người khác đang giữ, chưa đưa", "Người đó ở xa, ở nước ngoài", "Người đó không hợp tác", "Không biết xin ở đâu", "Khác"];
const DOC_WRONG = ["Sai họ tên, chữ đệm", "Sai ngày tháng năm sinh", "Thông tin giữa các giấy không khớp nhau", "Sai diện tích, số thửa, tờ bản đồ", "Giấy cũ, rách, mờ, không đọc được", "Hết hạn (căn cước)", "Khác"];
function docRow(attrs, uid, key, label, st){
  st = st === 1 ? {s:"co"} : (st || {});
  const s = st.s || "";
  const opt = (v, t, cls) => `<label><input type="radio" name="${uid}_${key}" value="${v}" ${attrs} data-doc="${key}" data-st="1" class="${cls}"${s === v ? " checked" : ""}><span>${t}</span></label>`;
  const reasons = s === "chua" ? DOC_MISS : s === "sai" ? DOC_WRONG : null;
  return `<div class="drow"><span class="dname">${esc(label)}</span><div class="seg">${opt("co", "Có", "")}${opt("chua", "Thiếu", "warn")}${opt("sai", "Sai", "no")}</div>` +
    (reasons ? `<label class="f dreason">${s === "sai" ? "Sai thế nào?" : "Vì sao thiếu?"}<select ${attrs} data-doc="${key}" data-reason="1"><option value="">Chọn lý do</option>${reasons.map(r => `<option${st.r === r ? " selected" : ""}>${esc(r)}</option>`).join("")}</select></label>` : "") + `</div>`;
}
function docRows(attrs, uid, keys, labels, docs){
  if (!keys.length) return "";
  return `<div class="drows"><span class="t">Giấy tờ: bấm Có, Thiếu hoặc Sai cho từng giấy</span>${keys.map(k => docRow(attrs, uid, k, labels[k], (docs || {})[k])).join("")}</div>`;
}
function docChange(t, docs, mirror){
  const k = t.dataset.doc, keys = mirror && mirror[k] ? [k].concat(mirror[k]) : [k];
  keys.forEach(kk => {
    const cur = docs[kk] === 1 ? {s:"co"} : (docs[kk] || {});
    docs[kk] = t.dataset.st ? {s:t.value, r: cur.s === t.value ? (cur.r || "") : ""} : Object.assign({}, cur, {r:t.value});
  });
}

/* ---------- Máy chủ (hoặc chạy thử trên máy) ---------- */
let devLoading = null;
function loadDev(){ return devLoading || (devLoading = loadDev0()); }
async function loadDev0(){
  if (devEngine) return;
  window.CacheService = {getScriptCache: () => ({get: () => null, put: () => {}, remove: () => {}})};
  for (const f of ["ThuaKe.gs", "SoDo.gs", "BangGia.gs", "GiaTinh.gs", "MauWord.gs"]) await new Promise((ok, bad) => { const s = document.createElement("script"); s.src = "../landing_page_backend/apps-script/" + f; s.onload = ok; s.onerror = () => bad(new Error("Không tải được bộ máy tính chạy thử")); document.head.appendChild(s); });
  devEngine = true;
}
let DEV_DS = null, DEV_PAID = false;
async function devTinh(ma){
  await loadDev();
  if (!DEV_DS){ DEV_DS = (await (await fetch("../landing_page_backend/bang_gia_tinh/_danh_sach.json")).json()).tinh; window.gtDanhSach = () => DEV_DS; }
  if (ma && !GT_MEM[ma]){
    const res = await fetch("../landing_page_backend/bang_gia_tinh/" + ma + ".json.gz");
    GT_MEM[ma] = JSON.parse(await new Response(res.body.pipeThrough(new DecompressionStream("gzip"))).text());
  }
}
const devReport = (input, who) => input.kind === "sodo" ? sdReport(input, who) : tkReport(input, who);
const devOffer = () => { const now = Date.now(); if (!window.DEV_UNTIL) window.DEV_UNTIL = now + 5 * 60e3; return {id:GOI_DEMO, amount: now < DEV_UNTIL ? GOI_PROMO : GOI_PRICE, list:GOI_PRICE, promo: now < DEV_UNTIL, promoUntil:new Date(DEV_UNTIL).toISOString(), now:new Date(now).toISOString(), transfer:"VMP " + GOI_DEMO + " " + (ME ? ME.phone : "")}; };
async function call(action, payload){
  if (CONFIG.ENDPOINT && !LOCAL_DEV) return api(action, payload);
  if (!LOCAL_DEV) throw new Error("Trang đang hoàn thiện, vui lòng gọi hotline " + CONFIG.PHONE + ".");
  const un = new Date(Date.now() - 60e3), who = {id:GOI_DEMO, name:(ME && ME.name) || "Khách chạy thử", xung:(ME && ME.xung) || "anh", phone:normPhone(payload.phone), unlocked:un, expires:new Date(Date.now() + 89 * 864e5), runs:0, dt:DTINFO};
  if (action === "tk_preview"){ await loadDev(); if (payload.input.sd && payload.input.sd.tinh && payload.input.sd.tinh !== "ha_noi") await devTinh(payload.input.sd.tinh); const out = devReport(payload.input, Object.assign({}, who, {id:"XEM-TRUOC", preview:true})); return {ok:true, summary: out.summary, teaser: out.teaser, offer: devOffer()}; }
  if (action === "tk_order") return Object.assign({ok:true}, devOffer());
  if (action === "tk_status"){
    if (String(payload.id).toUpperCase() !== GOI_DEMO) throw new Error("Mã hoặc số điện thoại không đúng");
    if (payload.check) DEV_PAID = true;
    await loadDev();
    return Object.assign({ok:true, id:GOI_DEMO, name:who.name, xung:who.xung, paid:DEV_PAID, expired:false, expires:who.expires.toISOString(), unlocked:un.toISOString(), unlockedTxt:tkVN(un), refundUntil:new Date(un.getTime() + 36e5).toISOString(), refundUntilTxt:tkVN(new Date(un.getTime() + 36e5)), saved:{}, all:(window.DEV_ALL = window.DEV_ALL || []), maxHs:3, runs:1, dt:DTINFO, myRef:"", refund:""}, DEV_PAID ? {} : devOffer());
  }
  if (action === "tk_run"){ await loadDev(); if (payload.input.sd && payload.input.sd.tinh && payload.input.sd.tinh !== "ha_noi") await devTinh(payload.input.sd.tinh); const out = devReport(payload.input, who);
    const L = window.DEV_ALL = window.DEV_ALL || []; let sl = +payload.slot || 0;
    if (sl >= L.length){ if (L.length >= 3) throw new Error("Mã này đã dùng đủ 3 hồ sơ."); L.push({ten:"Hồ sơ " + (L.length + 1)}); sl = L.length - 1; }
    L[sl][payload.input.kind] = payload.input; if (payload.ten) L[sl].ten = payload.ten;
    return {ok:true, html:out.html, heirs:out.heirs, mau:out.mau, slot:sl, hoso:L.map((h, i) => ({slot:i, ten:h.ten}))}; }
  if (action === "tk_mail") return {ok:true};
  if (action === "gia_tim"){
    if (payload.tinh && payload.tinh !== "ha_noi"){ await devTinh(payload.tinh); return {ok:true, rows: gtTim(payload.tinh, payload.ward, payload.q)}; }
    await loadDev(); return {ok:true, rows: bgTim(payload.ward, payload.q), nn: bgNongNghiep(payload.ward)};
  }
  if (action === "gia_tinh"){ await devTinh(); return {ok:true, tinh: DEV_DS}; }
  if (action === "gia_xa"){ await devTinh(payload.tinh); return {ok:true, xa: gtXa(payload.tinh)}; }
  if (action === "hoan_tien") return {ok:true, eligible:true, msg:"(Chạy thử) Bên em đã nhận yêu cầu, trong hạn 60 phút. " + nguoi().Xung + " được hoàn 100% trong 10 ngày làm việc (không tính thứ Bảy, Chủ nhật)."};
  if (action === "aff_tao" || action === "aff_xem") return {ok:true, ma:"TUAN-7K3", link: location.origin + location.pathname + "?ref=TUAN-7K3", khach:2, muc:20, conLen30:3, choTra:40000, daTra:0, coSTK:!!payload.acc, don:[{id:"HS7K••••", ngay:"10/10/2026", hh:20000, rate:0.2, st:"Chờ trả (kỳ 2 tuần)"}, {id:"HSQ2••••", ngay:"11/10/2026", hh:20000, rate:0.2, st:"Chờ hết 60 phút hoàn tiền"}]};
  if (action === "dt_info") return {ok:true, dt: /^DT-/i.test(payload.ma) ? {ma:payload.ma.toUpperCase(), ten:"Văn phòng luật sư chạy thử", nguoi:"Nguyễn Văn An", chucdanh:"Luật sư", sdt:"0900000000", zalo:"0900000000", diachi:"Hà Nội"} : null};
  if (action === "mau_tai"){ const res = await fetch("../landing_page_backend/mau_word_web/" + payload.ma + ".docx"); const b = new Uint8Array(await res.arrayBuffer()); let s = ""; b.forEach(x => s += String.fromCharCode(x)); return {ok:true, name: payload.ma + " - chay thu.docx", b64: btoa(s)}; }
}

/* ---------- Link giới thiệu (?ref=) và link đối tác (?dt=): nhớ 90 ngày trên máy khách ---------- */
function keepParam(name, key){
  const v = new URLSearchParams(location.search).get(name);
  if (v && /^[A-Za-z0-9-]{3,24}$/.test(v)) lsSet(key, {v: v.toUpperCase(), t: Date.now()});
  const s = lsGet(key);
  if (s && Date.now() - s.t > KEEP_DAYS * 864e5){ lsSet(key, null); return ""; }
  return s ? s.v : "";
}
const REF = () => keepParam("ref", "hs_ref"), DT = () => keepParam("dt", "hs_dt");
async function loadPartner(){
  const ma = DT(); if (!ma) return;
  try { const r = await call("dt_info", {ma}); DTINFO = r.dt; } catch(e){ DTINFO = null; }
  if (!DTINFO) return;
  const z = String(DTINFO.zalo || DTINFO.sdt).replace(/\D/g, ""), t = String(DTINFO.sdt).replace(/\D/g, "");
  $("partnerTop").innerHTML = `<div class="partner" style="margin-top:14px"><span>Hồ sơ của anh chị được hỗ trợ bởi <b>${esc((DTINFO.chucdanh ? DTINFO.chucdanh + " " : "") + DTINFO.nguoi)}</b>${DTINFO.ten ? " — " + esc(DTINFO.ten) : ""}</span><a class="btn small" href="tel:${t}">Gọi ${esc(DTINFO.sdt)}</a><a class="btn ghost small" target="_blank" rel="noopener" href="https://zalo.me/${z}">Zalo</a></div>`;
  document.querySelectorAll("header a.zalo").forEach(a => a.href = "https://zalo.me/" + z);
  document.querySelectorAll("header .zalo-no").forEach(s => s.textContent = DTINFO.zalo || DTINFO.sdt);
}

/* ---------- Thẻ Thừa kế / Sổ đỏ ---------- */
function setTab(t){
  TAB = t === "sodo" ? "sodo" : "thuake";
  document.querySelectorAll("[data-tab]").forEach(b => b.setAttribute("aria-selected", b.dataset.tab === TAB));
  $("formTK").hidden = TAB !== "thuake"; $("formSD").hidden = TAB !== "sodo";
  goiFormChanged(); goiProg();
}
function goiFormChanged(){
  $("tkResult").innerHTML = ""; $("repTools").hidden = true;
  if (OFFER && !ORDER && !$("teaser").hidden){ $("teaser").innerHTML = `<p class="muted">Thông tin vừa thay đổi: bấm "Xem kết luận miễn phí" để cập nhật kết luận.</p><div id="offerBox"></div>`; renderOffer($("offerBox")); }
  else $("teaser").hidden = true;
}
const buildInput = () => Object.assign({kind:TAB}, FORMS[TAB].buildInput());
function toolbarMode(){
  $("prevBtn").hidden = !!ORDER; $("runBtn").hidden = !ORDER;
  if (ORDER){
    const g = nguoi(ORDER), days = ORDER.expires ? Math.max(0, Math.ceil((new Date(ORDER.expires) - Date.now()) / 864e5)) : KEEP_DAYS;
    const hrs = ORDER.refundUntil ? (new Date(ORDER.refundUntil) - Date.now()) / 36e5 : 0;
    $("modeNote").innerHTML = `Chào ${esc(g.goi)} · mã <b>${esc(ORDER.id)}</b> còn <b>${days} ngày</b>${hrs > 0 ? ` · còn <b>${Math.max(1, Math.round(hrs * 60))} phút</b> để yêu cầu hoàn tiền nếu thấy không xứng đáng` : ""}. Xem báo cáo đầy đủ cho cả hai thẻ Thừa kế và Sổ đỏ.`;
  } else $("modeNote").innerHTML = `Xem kết luận 60 giây miễn phí trước. Báo cáo đầy đủ ${money(GOI_PRICE)} cho cả hai báo cáo, có giá đăng ký lần đầu.`;
}

/* ---------- Xem trước miễn phí + ưu đãi lần đầu ---------- */
async function preview(){
  if (!meReady()){ meRender(true); $("meBox").scrollIntoView({behavior:"smooth", block:"center"}); $("meMsg").innerHTML = `<span class="errmsg" style="display:inline-block;padding:6px 10px">Cho bên em biết tên và số điện thoại để lập kết luận riêng cho anh chị.</span>`; return; }
  $("prevBtn").disabled = true; $("runMsg").textContent = "Đang lập kết luận…";
  try {
    const r = await call("tk_preview", Object.assign({input: buildInput(), name: ME.name, phone: ME.phone, xung: ME.xung, ref: REF(), dt: DT()}, consentOf()));
    let h = r.teaser || "";
    if (r.offer && r.offer.paidExists) h += `<p class="okmsg">Số điện thoại ${esc(mask(ME.phone))} đã có báo cáo đã thanh toán. Mở bằng link trong tin nhắn Zalo, email, hoặc nhập mã ở mục <a href="#mo">Tôi đã có mã</a>.</p>`;
    else if (r.offer) h += `<div id="offerBox"></div>`;
    $("teaser").innerHTML = h; $("teaser").hidden = false; $("runMsg").textContent = "";
    if (r.offer && !r.offer.paidExists){ setOffer(r.offer); renderOffer($("offerBox")); }
    $("teaser").scrollIntoView({behavior:"smooth", block:"start"});
  } catch(e){ $("runMsg").textContent = e.message; }
  $("prevBtn").disabled = false;
}
function setOffer(o){ OFFER = o; SKEW = o.now ? new Date(o.now) - Date.now() : 0; startPoll(); }
const leftMs = () => OFFER && OFFER.promoUntil ? new Date(OFFER.promoUntil) - (Date.now() + SKEW) : 0;
const qrOf = (amount, transfer) => bankReady() ? `https://img.vietqr.io/image/${encodeURIComponent(BANK.bankId)}-${encodeURIComponent(BANK.account.replace(/\s/g, ""))}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(transfer)}&accountName=${encodeURIComponent(BANK.holder.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "D").toUpperCase())}` : "";
function renderOffer(box){
  if (!box || !OFFER) return;
  box.dataset.offer = "1";
  const g = nguoi(), ms = leftMs(), promo = OFFER.promo && ms > 0, amount = promo ? OFFER.amount : Math.max(OFFER.amount, OFFER.list || GOI_PRICE);
  const mm = Math.max(0, Math.floor(ms / 60e3)), ss = Math.max(0, Math.floor(ms / 1e3) % 60), qr = qrOf(amount, OFFER.transfer);
  box.innerHTML = `<div class="offer${promo ? "" : " expired"}">
    <div class="offer-h">${promo ? `<b>Giá đăng ký lần đầu của ${esc(g.goi)}</b><span class="now">${money(amount)}</span><span class="muted">giá thông thường ${money(OFFER.list || GOI_PRICE)}</span><span class="cd">${mm}:${String(ss).padStart(2, "0")}</span>` : `<b>Mở báo cáo đầy đủ</b><span class="now">${money(amount)}</span>${OFFER.promoUntil ? `<span class="muted">Thời gian áp dụng giá đăng ký lần đầu đã hết</span>` : ""}`}</div>
    ${promo ? `<p style="font-size:.92rem">Giá đăng ký lần đầu áp dụng khi chuyển khoản trong thời gian đếm ngược (mỗi số điện thoại một lần). Hết giờ, áp dụng giá thông thường ${money(OFFER.list || GOI_PRICE)}.</p>` : ""}
    <div class="pay">${qr ? `<img src="${qr}" alt="Mã QR chuyển khoản ${money(amount)}" onerror="this.remove()">` : ""}
      <div style="display:grid;gap:12px;min-width:0">
        <p class="okmsg">Mã hồ sơ của ${esc(g.goi)}: <b class="mono">${esc(OFFER.id)}</b>. Quét mã QR bằng app ngân hàng, số tiền và nội dung đã điền sẵn.</p>
        <div class="kv">
          <span>Ngân hàng</span><b>${esc(BANK.bankName)}</b><span></span>
          <span>Số tài khoản</span><b class="mono">${esc(BANK.account)}</b><button type="button" class="btn ghost small" data-copy="${esc(BANK.account.replace(/\s/g, ""))}">Sao chép</button>
          <span>Chủ tài khoản</span><b>${esc(BANK.holder)}</b><span></span>
          <span>Số tiền</span><b>${money(amount)}</b><span></span>
          <span>Nội dung</span><b style="color:var(--seal)">${esc(OFFER.transfer)}</b><button type="button" class="btn ghost small" data-copy="${esc(OFFER.transfer)}">Sao chép</button>
        </div>
        <p class="refund">${refundText()}</p>
        <div class="ctas" style="margin-top:0"><button type="button" class="btn" data-check-paid="1">Tôi đã chuyển khoản, kiểm tra mở khóa</button><a class="btn ghost" target="_blank" rel="noopener" href="https://zalo.me/${CONFIG.ZALO.replace(/\D/g, "")}" data-zmsg="Chào ${esc(CONFIG.BRAND)}, tôi là ${esc(ME ? ME.name : "")}, đã chuyển khoản cho mã hồ sơ ${esc(OFFER.id)}. Nhờ bên em mở khóa giúp.">Nhắn Zalo ${esc(CONFIG.ZALO)}</a></div>
        <p class="muted" style="font-size:.9rem" data-paymsg>Trang tự kiểm tra mỗi 15 giây. Chưa mở khóa ngay thì bên em mở và gửi link qua Zalo, thường trong 30 phút (giờ làm việc).</p>
      </div></div></div>`;
  $("uMa").value = OFFER.id; if (ME) $("uPhone").value = ME.phone;
  clearInterval(TICK);
  if (promo) TICK = setInterval(() => {
    const m2 = leftMs();
    if (m2 <= 0){ clearInterval(TICK); document.querySelectorAll("[data-offer]").forEach(b => { if (document.body.contains(b)) renderOffer(b); }); return; }
    document.querySelectorAll(".cd").forEach(el => el.textContent = Math.floor(m2 / 60e3) + ":" + String(Math.floor(m2 / 1e3) % 60).padStart(2, "0"));
  }, 1000);
}
function startPoll(){
  clearInterval(POLL);
  const t0 = Date.now();
  POLL = setInterval(() => {
    if (ORDER || !OFFER || Date.now() - t0 > 30 * 60e3){ clearInterval(POLL); return; }
    if (document.visibilityState === "visible") checkPaid(false);
  }, 15000);
}
async function checkPaid(manual){
  if (!OFFER || !ME) return;
  const msgs = document.querySelectorAll("[data-paymsg]");
  if (manual) msgs.forEach(m => m.textContent = "Đang kiểm tra…");
  try {
    const r = await call("tk_status", {id: OFFER.id, phone: ME.phone, check: manual});
    if (r.paid){ await onUnlocked(r, OFFER.id, ME.phone); return; }
    if (manual) msgs.forEach(m => m.innerHTML = `<span class="errmsg" style="display:block">Chưa thấy tiền về cho mã ${esc(OFFER.id)}. Ngân hàng có thể chậm vài phút; trang vẫn tự kiểm tra. Cần nhanh, nhắn Zalo ${esc(CONFIG.ZALO)} kèm ảnh chuyển khoản.</span>`);
  } catch(e){ if (manual) msgs.forEach(m => m.textContent = e.message); }
}

/* ---------- Nhiều hồ sơ trong một mã (tối đa 3: cho mình, cho người thân, bạn bè) ---------- */
function hsName(i){ return (ALL[i] && ALL[i].ten) || "Hồ sơ " + (i + 1); }
function hsRender(){
  const bar = $("hsBar"); if (!bar) return;
  if (!ORDER){ bar.innerHTML = ""; return; }
  const n = ALL.length, left = MAX_HS - n, g = nguoi(ORDER);
  bar.innerHTML = `<div class="partner" style="background:var(--card)"><b>Hồ sơ đang xem:</b>
    <select id="hsSel" style="width:auto">${ALL.map((h, i) => `<option value="${i}"${i === SLOT && !NEWHS ? " selected" : ""}>${esc(hsName(i))}</option>`).join("")}${NEWHS ? `<option selected>(hồ sơ mới)</option>` : ""}</select>
    <input id="hsTen" style="width:auto;min-width:180px" placeholder="Đặt tên, ví dụ: Đất anh Hùng (bạn)" value="${esc(NEWHS ? "" : hsName(SLOT))}">
    ${left > 0 && !NEWHS ? `<button type="button" class="btn ghost small" id="hsNew">+ Hồ sơ cho người khác (còn ${left})</button>` : ""}
    <small class="muted" style="width:100%">Một mã dùng miễn phí tối đa ${MAX_HS} hồ sơ, mỗi hồ sơ lưu riêng cả thừa kế và sổ đỏ.${left <= 0 ? " Đã dùng đủ: " + esc(g.xung) + " có thể gửi link giới thiệu (cuối báo cáo) để người thân tự xem và " + esc(g.xung) + " nhận 20–30%." : " Muốn bạn bè tự xem? Gửi link giới thiệu ở cuối báo cáo, " + esc(g.xung) + " nhận 20–30%."}</small></div>`;
  $("hsSel").onchange = e => hsOpen(+e.target.value);
  if ($("hsNew")) $("hsNew").onclick = hsNew;
}
function hsOpen(i){
  NEWHS = false; SLOT = i;
  const h = ALL[i] || {};
  FORMS.thuake.reset(); FORMS.sodo.reset();
  if (h.thuake) FORMS.thuake.load(h.thuake);
  if (h.sodo) FORMS.sodo.load(h.sodo);
  setTab(h.thuake || !h.sodo ? "thuake" : "sodo");
  hsRender(); goiFormChanged();
  $("runMsg").textContent = "Đã mở " + hsName(i) + ". Bấm \"Xem báo cáo đầy đủ\".";
}
function hsNew(){
  NEWHS = true; SLOT = ALL.length;
  FORMS.thuake.reset(); FORMS.sodo.reset(); setTab("thuake"); hsRender(); goiFormChanged();
  $("hsTen").focus();
  $("runMsg").textContent = "Hồ sơ mới: đặt tên, điền thông tin rồi bấm \"Xem báo cáo đầy đủ\".";
}

/* ---------- Báo cáo đầy đủ ---------- */
async function run(){
  if (!ORDER) return;
  $("runBtn").disabled = true; $("runMsg").textContent = "Đang lập báo cáo riêng cho " + nguoi(ORDER).goi + "…";
  try {
    const input = buildInput();
    const ten = $("hsTen") ? $("hsTen").value.trim() : "";
    const r = await call("tk_run", {id:ORDER.id, phone:ORDER.phone, input, slot: SLOT, ten});
    if (r.slot != null){ SLOT = r.slot; NEWHS = false; ALL[SLOT] = Object.assign({}, ALL[SLOT], {ten: (r.hoso && r.hoso[SLOT] && r.hoso[SLOT].ten) || ten || hsName(SLOT)}, {[input.kind]: input}); hsRender(); }
    $("tkResult").innerHTML = r.html; $("repTools").hidden = false; $("runMsg").textContent = ""; $("teaser").hidden = true;
    initCustom(+input.value || 0); initDrafts(); initMau(); initRefund(); initAff(); initZaloMsg();
    $("tkResult").scrollIntoView({behavior:"smooth"});
  } catch(e){ $("runMsg").textContent = ""; $("tkResult").innerHTML = `<p class="errmsg">${esc(e.message)}</p>`; }
  $("runBtn").disabled = false;
}
function copyText(text, btn){
  const done = () => { const t = btn.textContent; btn.textContent = "Đã chép"; setTimeout(() => btn.textContent = t, 1500); };
  if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, () => alertSel(btn));
  else alertSel(btn);
}
function alertSel(btn){ btn.textContent = "Bôi đen để chép"; }
/* File Word: trang bìa riêng + báo cáo + lời cảm ơn */
function wordFile(title, bodyHtml){
  const g = nguoi(ORDER || ME), lh = DTINFO ? (DTINFO.chucdanh ? DTINFO.chucdanh + " " : "") + DTINFO.nguoi + " — Zalo " + (DTINFO.zalo || DTINFO.sdt) : "Tư vấn Vua Mặt Phố — Zalo " + CONFIG.ZALO;
  const cover = ORDER ? `<div style="text-align:center;margin-top:110pt"><p style="font-size:24pt;font-weight:bold;color:#0F5A48">HỒ SƠ NHÀ ĐẤT</p><p style="font-size:16pt">Chuẩn bị riêng cho gia đình ${esc(g.goi)}</p>
    <p>Mã hồ sơ: <b>${esc(ORDER.id)}</b> · Lập ngày ${new Date().toLocaleDateString("vi-VN")}</p><p>Người hướng dẫn: ${esc(lh)}</p><p style="color:#56655E;font-size:10pt;margin-top:60pt">Hồ sơ riêng của ${esc(g.goi)} · ${esc(mask(ORDER.phone))} · ${esc(ORDER.id)}<br>Mọi con số là dự kiến, tham khảo; kết quả cuối cùng do cơ quan chức năng xác định.</p><p style="font-family:'Segoe Script',cursive;font-size:18pt;color:#0F5A48;margin-top:30pt">Vua Mặt Phố</p></div><br style="page-break-before:always" clear="all">` : "";
  return `<html><head><meta charset="utf-8"><title>${esc(title)}</title><style>body{font-family:"Times New Roman",serif;font-size:13pt;line-height:1.5}table{border-collapse:collapse;width:100%}th,td{border:1px solid #999;padding:4px}pre{white-space:pre-wrap;font-family:"Times New Roman",serif}.ftree,.flegend,.tk-bar,.toolbar,.btn,.tk-noemail{display:none}.tk-stamp{color:#B8322A;font-size:10pt}.tk-hello,.tk-sum,.tk-cta{background:#E1EEE8;padding:8pt}.tk-honest,.fwarn,.tk-hard{background:#FBF0D9;padding:6pt}.sig{font-family:'Segoe Script',cursive;font-size:16pt;color:#0F5A48}.tk-noweb{display:block}</style></head><body>${cover}${bodyHtml}</body></html>`;
}
function initDrafts(){
  document.querySelectorAll("#tkResult pre.tk-draft").forEach((pre, i) => {
    const bar = document.createElement("div"); bar.className = "toolbar";
    bar.innerHTML = `<button type="button" class="btn small" data-dcopy="${i}">Sao chép</button><button type="button" class="btn ghost small" data-dword="${i}">Tải file Word</button>`;
    pre.after(bar);
  });
}
/* Mẫu đơn chính thức: thêm nút tải vào từng dòng */
function initMau(){
  document.querySelectorAll("#tkResult li[data-mau]").forEach(li => {
    const b = document.createElement("button"); b.type = "button"; b.className = "btn small"; b.dataset.mauDl = li.dataset.mau; b.textContent = "Tải Word";
    li.appendChild(b);
  });
}
async function mauDownload(btn){
  const t = btn.textContent; btn.disabled = true; btn.textContent = "Đang tạo…";
  try {
    const r = await call("mau_tai", {id:ORDER.id, phone:ORDER.phone, ma:btn.dataset.mauDl, slot:SLOT});
    const bin = atob(r.b64), arr = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([arr], {type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"})); a.download = r.name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 3000);
    btn.textContent = "Đã tải";
  } catch(e){ btn.textContent = t; toast(e.message); }
  btn.disabled = false;
}
/* Yêu cầu hoàn tiền ngay cuối báo cáo */
const HT_LYDO = ["Báo cáo chưa đúng với hồ sơ của tôi", "Nội dung khó hiểu", "Không có thông tin tôi cần", "Tôi đã biết hầu hết những điều này", "Chi phí, thời gian chưa sát thực tế", "Lý do khác"];
function initRefund(){
  const box = document.querySelector("#tkResult [data-refund-box]"); if (!box || !ORDER) return;
  const g = nguoi(ORDER), left = ORDER.refundUntil ? new Date(ORDER.refundUntil) - Date.now() : 0;
  if (ORDER.refund){ box.innerHTML = `<div class="refbox"><b>Yêu cầu hoàn tiền</b><p>Bên em đã ghi nhận: ${esc(ORDER.refund)}.</p></div>`; return; }
  box.innerHTML = `<div class="refbox"><b>${left > 0 ? `Thấy chưa xứng đáng? ${esc(g.Xung)} còn ${Math.max(1, Math.round(left / 6e4))} phút để yêu cầu hoàn tiền` : "Yêu cầu hoàn tiền"}</b>
    <p class="muted" style="font-size:.88rem">Hạn: ${esc(ORDER.refundUntilTxt || "60 phút sau khi mở khóa")}. Trong hạn: hoàn 100% trong 10 ngày làm việc (không tính thứ Bảy, Chủ nhật), <b>chỉ về đúng tài khoản đã chuyển khoản</b> (không cần điền số tài khoản). Yêu cầu hoàn về tài khoản khác không hợp lệ và không được xử lý. Gửi yêu cầu xong, mã ngừng sử dụng. Góp ý của ${esc(g.xung)} giúp bên em làm tốt hơn.</p>
    <div class="chk">${HT_LYDO.map((x, i) => `<label><input type="checkbox" value="${esc(x)}" data-ht="${i}"><span>${esc(x)}</span></label>`).join("")}</div>
    <label class="f">Ghi thêm <span class="hint">không bắt buộc</span><textarea id="htNote" rows="2"></textarea></label>
    <div class="toolbar"><button type="button" class="btn ghost small" id="htGo">Gửi yêu cầu hoàn tiền</button><span class="muted" id="htMsg"></span></div></div>`;
  $("htGo").onclick = async () => {
    const reasons = [...box.querySelectorAll("[data-ht]:checked")].map(x => x.value);
    if (!reasons.length){ $("htMsg").textContent = "Chọn ít nhất một lý do."; return; }
    if ($("htGo").dataset.sure !== "1"){ $("htGo").dataset.sure = "1"; $("htGo").textContent = "Bấm lần nữa để gửi"; return; }
    $("htGo").disabled = true; $("htMsg").textContent = "Đang gửi…";
    try { const r = await call("hoan_tien", {id:ORDER.id, phone:ORDER.phone, reasons, note:$("htNote").value}); box.innerHTML = `<div class="refbox"><b>Yêu cầu hoàn tiền</b><p class="${r.eligible === false ? "errmsg" : "okmsg"}">${esc(r.msg)}</p></div>`; ORDER.refund = "Đã gửi yêu cầu"; }
    catch(e){ $("htMsg").textContent = e.message; $("htGo").disabled = false; }
  };
}
/* Link giới thiệu cho khách đã mua */
function affHtml(r){
  const g = nguoi(ORDER), msg = `Mình vừa dùng trang này để biết làm thừa kế, sổ đỏ cần giấy gì, đi đâu, chi phí dự kiến bao nhiêu. Xem kết luận miễn phí trước rồi hãy quyết định: ${r.link}`;
  return `<p>Link riêng của ${esc(g.goi)}: <b class="mono">${esc(r.link)}</b></p>
    <div class="toolbar"><button type="button" class="btn small" data-copy="${esc(r.link)}">Sao chép link</button><button type="button" class="btn ghost small" data-copy="${esc(msg)}">Chép tin nhắn mẫu</button><a class="btn ghost small" target="_blank" rel="noopener" href="https://zalo.me/" data-zmsg="${esc(msg)}">Gửi qua Zalo</a></div>
    <p style="font-size:.92rem">Mã giới thiệu: <b class="mono">${esc(r.ma)}</b> · Đã có <b>${r.khach}</b> người mua qua link · Mức hiện tại <b>${r.muc}%</b>${r.conLen30 ? ` · còn ${r.conLen30} người nữa lên 30%` : ""} · Chờ trả: <b>${money(r.choTra) || "0 đ"}</b>${r.daTra ? ` · Đã trả: ${money(r.daTra)}` : ""}</p>
    ${(r.don || []).length ? `<div class="table-box"><table><thead><tr><th>Đơn</th><th>Ngày</th><th>Hoa hồng</th><th>Trạng thái</th></tr></thead><tbody>${r.don.map(d => `<tr><td class="mono">${esc(d.id)}</td><td>${esc(d.ngay)}</td><td class="mono">${d.hh ? money(d.hh) + " (" + Math.round(d.rate * 100) + "%)" : "—"}</td><td>${esc(d.st)}</td></tr>`).join("")}</tbody></table></div>` : ""}
    ${r.coSTK ? `<p class="muted" style="font-size:.88rem">Đã có số tài khoản nhận hoa hồng.</p>` : `<details><summary>Thêm số tài khoản nhận hoa hồng</summary><div class="row2" style="margin-top:8px"><label class="f">Ngân hàng<input id="afBank" placeholder="Vietcombank"></label><label class="f">Số tài khoản<input id="afAcc" inputmode="numeric"></label><label class="f">Chủ tài khoản<input id="afHolder" placeholder="NGUYEN VAN TUAN"></label></div><div><button type="button" class="btn ghost small" id="afSave">Lưu</button></div></details>`}`;
}
function initAff(){
  const box = document.querySelector("#tkResult [data-aff-box]"); if (!box || !ORDER) return;
  const g = nguoi(ORDER);
  box.innerHTML = `<div class="affbox"><b>Giới thiệu người thân, nhận 20–30%</b>
    <p style="font-size:.93rem">${esc(g.Xung)} từng loay hoay với giấy tờ thừa kế, sổ đỏ — người thân, hàng xóm của ${esc(g.xung)} có thể cũng đang như vậy. Gửi họ đường link riêng: họ có ngay bản hướng dẫn rõ ràng, còn ${esc(g.xung)} nhận 20% mỗi người cho 5 người đầu, từ người thứ 6 nhận 30%. Một việc tốt, một khoản thu thêm.</p>
    <p class="muted" style="font-size:.85rem">Trả 2 tuần một lần, chỉ tính đơn đã qua 60 phút hoàn tiền. ${esc(g.Xung)} không thấy tên, số điện thoại của người được giới thiệu.</p>
    <div id="affOut">${ORDER.myRef ? "" : `<button type="button" class="btn" id="afGo">Tạo link giới thiệu của tôi</button>`}</div></div>`;
  const show = r => { $("affOut").innerHTML = affHtml(r); ORDER.myRef = r.ma; initZaloMsg();
    const s = $("afSave"); if (s) s.onclick = async () => { try { show(await call("aff_tao", {id:ORDER.id, phone:ORDER.phone, bank:$("afBank").value, acc:$("afAcc").value, holder:$("afHolder").value})); toast("Đã lưu số tài khoản."); } catch(e){ toast(e.message); } }; };
  if (ORDER.myRef) call("aff_xem", {ma:ORDER.myRef, phone:ORDER.phone}).then(show).catch(() => {});
  else $("afGo").onclick = async () => { $("afGo").disabled = true; try { show(await call("aff_tao", {id:ORDER.id, phone:ORDER.phone})); } catch(e){ toast(e.message); $("afGo").disabled = false; } };
}
/* Nút Zalo: chép sẵn tin nhắn có tên và mã hồ sơ rồi mở Zalo */
function initZaloMsg(){
  if (!ORDER) return;
  const g = nguoi(ORDER);
  document.querySelectorAll('#tkResult .tk-cta a[href*="zalo.me"]').forEach(a => { if (!a.dataset.zmsg) a.dataset.zmsg = `Chào anh chị, tôi là ${ORDER.name || g.goi}, mã hồ sơ ${ORDER.id} trên trang Hồ sơ nhà đất. Tôi muốn đặt lịch tư vấn về hồ sơ ${TAB === "sodo" ? "sổ đỏ" : "thừa kế"} của gia đình.`; });
}
document.addEventListener("click", e => {
  const c = e.target.closest("[data-copy]"); if (c){ copyText(c.dataset.copy, c); return; }
  const z = e.target.closest("a[data-zmsg]"); if (z){ try { navigator.clipboard && navigator.clipboard.writeText(z.dataset.zmsg); toast("Đã chép sẵn tin nhắn, dán vào Zalo là gửi được."); } catch(err){} }
  const dc = e.target.closest("[data-dcopy]"), dw = e.target.closest("[data-dword]"), md = e.target.closest("[data-mau-dl]"), cp = e.target.closest("[data-check-paid]");
  const pres = document.querySelectorAll("#tkResult pre.tk-draft");
  if (dc){ copyText(pres[+dc.dataset.dcopy].textContent, dc); return; }
  if (dw){ const pre = pres[+dw.dataset.dword]; saveFile(pre.dataset.title + ".doc", wordFile(pre.dataset.title, `<pre>${esc(pre.textContent)}</pre>`), "application/msword"); return; }
  if (md){ mauDownload(md); return; }
  if (cp){ checkPaid(true); return; }
  if (e.target.closest("[data-me-edit]")) meRender(true);
});

/* ---------- Mua (không qua bước xem trước) ---------- */
function refundText(){ return `<b>Có thể yêu cầu hoàn tiền trong 60 phút, hoàn tiền trong 10 ngày làm việc (không tính thứ Bảy, Chủ nhật), chỉ về đúng tài khoản đã chuyển khoản.</b> Hạn 60 phút tính từ lúc tài khoản được kích hoạt (mở khóa); gửi yêu cầu ngay cuối báo cáo hoặc nhắn Zalo ${esc(CONFIG.ZALO)} kèm mã hồ sơ. Mỗi số điện thoại được hoàn tiền 1 lần; sau khi gửi yêu cầu hoàn tiền, mã ngừng sử dụng (hồ sơ vẫn được lưu). <a href="#dieukien">Điều kiện hoàn tiền</a>`; }
async function buy(){
  const name = $("bName").value.trim(), phone = normPhone($("bPhone").value), email = $("bEmail").value.trim(), out = $("buyOut");
  if (!name || !/^0\d{9}$/.test(phone)){ out.innerHTML = `<p class="errmsg">Nhập họ tên và số điện thoại 10 số.</p>`; return; }
  if (!$("bOk").checked){ out.innerHTML = `<p class="errmsg">Cần tick ô đồng ý để bên em được dùng thông tin lập báo cáo.</p>`; return; }
  if (!meReady() || ME.phone !== phone){ ME = Object.assign({xung:(ME && ME.xung) || "anh"}, ME, {name, phone, consent: (ME && ME.consent) || new Date().toISOString()}); lsSet("hs_me", ME); meRender(false); }
  $("bGo").disabled = true; out.innerHTML = `<p class="muted">Đang tạo mã…</p>`;
  try {
    const r = await call("tk_order", Object.assign({name, phone, email, xung: ME.xung, ref: REF(), dt: DT()}, consentOf()));
    out.innerHTML = `<div id="offerBuy"></div>`; setOffer(r); renderOffer($("offerBuy"));
  } catch(e){ out.innerHTML = `<p class="errmsg">${esc(e.message)}</p>`; }
  $("bGo").disabled = false;
}

/* ---------- Mở khóa ---------- */
async function onUnlocked(r, id, phone){
  clearInterval(POLL); clearInterval(TICK);
  ORDER = {id, phone, name:r.name, xung:r.xung, expires:r.expires, unlocked:r.unlocked, refundUntil:r.refundUntil, refundUntilTxt:r.refundUntilTxt, myRef:r.myRef || "", refund:r.refund || ""};
  try { sessionStorage.setItem("hs_order", JSON.stringify(ORDER)); } catch(e){}
  lsSet("hs_last", {id, phone});
  if (r.dt) DTINFO = r.dt;
  const g = nguoi(ORDER), msg = `<span class="okmsg" style="display:block">Đã mở khóa lúc <b>${esc(r.unlockedTxt)}</b>, dùng đến ngày ${new Date(r.expires).toLocaleDateString("vi-VN")}. Hạn gửi yêu cầu hoàn tiền: <b>${esc(r.refundUntilTxt)}</b>.</span>`;
  $("useOut").innerHTML = msg;
  document.querySelectorAll("[data-paymsg]").forEach(m => m.innerHTML = msg);
  ALL = r.all || []; MAX_HS = r.maxHs || 3; SLOT = 0; NEWHS = false; hsRender();
  const sv = r.saved || {};
  if (sv.thuake && !FORMS.thuake.hasData()) FORMS.thuake.load(sv.thuake);
  if (sv.sodo && !FORMS.sodo.hasData()) FORMS.sodo.load(sv.sodo);
  if (!FORMS[TAB].hasData() && FORMS[TAB === "sodo" ? "thuake" : "sodo"].hasData()) setTab(TAB === "sodo" ? "thuake" : "sodo");
  toolbarMode(); goiFormChanged();
  toast((Number(r.runs) > 0 ? "Chào mừng " + g.goi + " quay lại!" : "Cảm ơn " + g.goi + "! Đã mở khóa.") + " Báo cáo đầy đủ đang được lập…");
  if (FORMS[TAB].hasData()) await run(); else $("lam").scrollIntoView({behavior:"smooth"});
}
async function unlock(){
  const id = $("uMa").value.trim().toUpperCase(), phone = normPhone($("uPhone").value), out = $("useOut");
  if (!id || !/^0\d{9}$/.test(phone)){ out.innerHTML = `<p class="errmsg">Nhập mã và số điện thoại 10 số.</p>`; return; }
  out.innerHTML = `Đang kiểm tra…`;
  try {
    const r = await call("tk_status", {id, phone, check:true});
    if (!r.paid){
      out.innerHTML = `<span class="errmsg" style="display:block">Mã ${esc(r.id)} chưa được xác nhận thanh toán. Đã chuyển khoản thì chờ ít phút rồi bấm lại, hoặc nhắn Zalo ${esc(CONFIG.ZALO)} kèm ảnh chuyển khoản.</span><div id="offerMo"></div>`;
      if (r.transfer){ setOffer(r); renderOffer($("offerMo")); }
      return;
    }
    if (r.refundLocked){ out.innerHTML = `<span class="errmsg" style="display:block">Mã ${esc(id)} đã gửi yêu cầu hoàn tiền nên ngừng sử dụng. Hồ sơ vẫn được lưu; muốn dùng lại thì đăng ký mã mới (giá thông thường).</span>`; return; }
    if (r.expired){
      /* Hết 90 ngày: hồ sơ cũ vẫn được giữ, nạp lại vào form; gia hạn = đăng ký lần 2 giá 199k, chép sang mã mới */
      const sv = r.saved || {};
      if (sv.thuake) FORMS.thuake.load(sv.thuake);
      if (sv.sodo) FORMS.sodo.load(sv.sodo);
      if (!meReady() || ME.phone !== phone){ ME = {name:r.name, phone, xung:r.xung, consent:"theo đơn " + id}; lsSet("hs_me", ME); meRender(false); }
      const g = nguoi();
      out.innerHTML = `<span class="okmsg" style="display:block">Chào ${esc(g.goi)}, mã ${esc(id)} đã hết 90 ngày sử dụng. <b>Hồ sơ cũ của ${esc(g.xung)} vẫn được giữ nguyên</b> và đã nạp lại vào form bên trên. Gia hạn thêm 90 ngày (${money(GOI_PRICE)}) để xem báo cáo cập nhật; toàn bộ hồ sơ cũ được chép sang mã mới.</span><div class="toolbar" style="margin-top:8px"><button type="button" class="btn" id="renewGo">Gia hạn hồ sơ của tôi</button><a class="btn ghost" href="#lam">Xem lại thông tin đã điền</a></div><div id="offerMo"></div>`;
      $("renewGo").onclick = async () => { try { const o = await call("tk_order", Object.assign({name:r.name, phone, xung:r.xung, ref: REF(), dt: DT()}, consentOf())); setOffer(o); renderOffer($("offerMo")); $("renewGo").remove(); } catch(e){ toast(e.message); } };
      return;
    }
    if (!meReady() || ME.phone !== phone){ ME = {name:r.name, phone, xung:r.xung, consent:"theo đơn " + id}; lsSet("hs_me", ME); meRender(false); }
    await onUnlocked(r, id, phone);
  } catch(e){ out.innerHTML = `<span class="errmsg" style="display:block">${esc(e.message)}</span>`; }
}

/* ---------- Gửi báo cáo, tải Word, sao chép link ---------- */
async function mailReport(){
  const email = $("rEmail").value.trim();
  $("rMsg").textContent = "Đang gửi…";
  try { await call("tk_mail", {id:ORDER.id, phone:ORDER.phone, email, kind:TAB, slot:SLOT}); $("rMsg").textContent = "Đã gửi báo cáo vào " + email + "."; if (ME){ ME.email = email; lsSet("hs_me", ME); } }
  catch(e){ $("rMsg").textContent = e.message; }
}
function wordReport(){
  const box = $("tkResult").cloneNode(true);
  box.querySelectorAll(".toolbar,[data-refund-box],[data-aff-box],button,input,textarea").forEach(x => x.remove());
  const g = nguoi(ORDER);
  saveFile("Ho so " + (TAB === "sodo" ? "so do" : "thua ke") + " - " + slug(g.goi) + " - " + (ORDER ? ORDER.id : "") + ".doc", wordFile("Hồ sơ " + (ORDER ? ORDER.id : ""), box.innerHTML), "application/msword");
}

/* ---------- Xem hoa hồng (mục Giới thiệu) ---------- */
async function affLookup(){
  const ma = $("gMa").value.trim().toUpperCase(), phone = normPhone($("gPhone").value);
  if (!ma || !/^0\d{9}$/.test(phone)){ $("gOut").innerHTML = `<p class="errmsg">Nhập mã giới thiệu và số điện thoại 10 số.</p>`; return; }
  try { const r = await call("aff_xem", {ma, phone}); ORDER = ORDER || {phone, name:"", xung:""}; $("gOut").innerHTML = affHtml(r); }
  catch(e){ $("gOut").innerHTML = `<p class="errmsg">${esc(e.message)}</p>`; }
}

/* ---------- Chào khách quay lại (chỉ dựa vào dữ liệu trên máy khách) ---------- */
function welcome(){
  if (!meReady()) return;
  const g = nguoi(), last = lsGet("hs_last"), hasForm = FORMS.thuake.hasData() || FORMS.sodo.hasData();
  $("welcome").innerHTML = `<div class="welcome"><span><b>Chào mừng ${esc(g.goi)} quay lại</b>, ${buoi()} an lành. ${last ? "Báo cáo của " + esc(g.xung) + " vẫn được giữ tại đây." : hasForm ? "Hồ sơ " + esc(g.xung) + " điền dở vẫn còn nguyên." : ""}</span>
    <span class="toolbar">${last ? `<button type="button" class="btn small" id="wOpen">Mở báo cáo của ${esc(g.xung)} (${esc(last.id)})</button>` : hasForm ? `<a class="btn small" href="#lam">Tiếp tục hồ sơ đang dở</a>` : ""}<button type="button" class="btn ghost small" id="wNot">Không phải ${esc(g.goi)}?</button></span></div>`;
  if ($("wOpen")) $("wOpen").onclick = () => { $("uMa").value = last.id; $("uPhone").value = last.phone; unlock(); };
  $("wNot").onclick = () => { ["hs_me", "hs_last", "hs_tk", "hs_sd"].forEach(k => lsSet(k, null)); try { sessionStorage.removeItem("hs_order"); } catch(e){} location.reload(); };
}

/* ---------- Khởi động ---------- */
function goiInit(forms){
  FORMS = forms; ME = lsGet("hs_me");
  document.querySelectorAll("[data-cfg]").forEach(el => el.textContent = CONFIG[el.dataset.cfg]);
  document.querySelectorAll("a.tel").forEach(a => a.href = "tel:" + CONFIG.PHONE.replace(/\D/g, ""));
  document.querySelectorAll("a.zalo").forEach(a => a.href = "https://zalo.me/" + CONFIG.ZALO.replace(/\D/g, ""));
  document.querySelectorAll("[data-refund]").forEach(el => el.innerHTML = refundText());
  if (!CONFIG.ENDPOINT || LOCAL_DEV){
    $("draft").hidden = false;
    $("draft").textContent = LOCAL_DEV ? `Chạy thử trên máy: mã ${GOI_DEMO}, số điện thoại bất kỳ. Bấm "Tôi đã chuyển khoản" để giả lập tiền về. Chưa nhận thanh toán thật.` : "Trang đang hoàn thiện: chưa nhận thanh toán trực tuyến. Vui lòng gọi hotline.";
  }
  FORMS.thuake.mount($("formTK")); FORMS.sodo.mount($("formSD"));
  meRender(!meReady());
  $("meBox").addEventListener("click", e => { if (e.target.id === "meGo") meSave(); });
  $("meBox").addEventListener("keydown", e => { if (e.key === "Enter" && e.target.tagName === "INPUT"){ e.preventDefault(); meSave(); } });
  document.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => setTab(b.dataset.tab));
  document.querySelectorAll("[data-goto]").forEach(a => a.addEventListener("click", () => setTab(a.dataset.goto)));
  $("prevBtn").onclick = preview; $("runBtn").onclick = run; $("bGo").onclick = buy; $("uGo").onclick = unlock; $("gGo").onclick = affLookup;
  $("rMail").onclick = mailReport; $("rWord").onclick = wordReport;
  $("rLink").onclick = e => copyText(location.origin + location.pathname + "?ma=" + (ORDER ? ORDER.id : "") + "#" + TAB, e.target);
  if (ME && ME.email) $("rEmail").value = ME.email;
  setTab(location.hash === "#sodo" ? "sodo" : "thuake");
  toolbarMode(); REF(); loadPartner();
  const ma = new URLSearchParams(location.search).get("ma");
  let saved = null; try { saved = JSON.parse(sessionStorage.getItem("hs_order") || "null"); } catch(e){}
  const last = lsGet("hs_last");
  if (ma){
    $("uMa").value = ma.toUpperCase();
    const ph = saved && saved.id === ma.toUpperCase() ? saved.phone : last && last.id === ma.toUpperCase() ? last.phone : "";
    if (ph) $("uPhone").value = ph;
    $("mo").scrollIntoView();
    if ($("uPhone").value) unlock(); else $("uPhone").focus();
  } else welcome();
}

/* Bảng tự chọn tỷ lệ (chỉ là phép cộng, không chứa cách tính) */
function initCustom(val){
  const box = document.getElementById("tkCustom"); if (!box) return;
  let heirs = []; try { heirs = JSON.parse(box.dataset.heirs); } catch(e){ return; }
  box.innerHTML = `<div class="table-box cust"><table><thead><tr><th>Người</th><th>Theo luật</th><th>Gia đình muốn chia (%)</th><th>Chênh lệch</th>${val ? "<th>Giá trị</th>" : ""}</tr></thead><tbody>
    ${heirs.map((h, i) => `<tr><td>${esc(h.who)}</td><td class="mono">${String(h.pct).replace(".", ",")}%</td><td><input type="number" min="0" max="100" step="0.1" data-ci="${i}" value="${h.pct}" aria-label="Tỷ lệ của ${esc(h.who)}"></td><td class="mono" id="cd${i}">0</td>${val ? `<td class="mono" id="cv${i}"></td>` : ""}</tr>`).join("")}
    </tbody></table></div><p id="cSum" style="margin-top:8px"></p>`;
  const upd = () => {
    let sum = 0;
    heirs.forEach((h, i) => {
      const v = +box.querySelector(`[data-ci="${i}"]`).value || 0; sum += v;
      const d = Math.round((v - h.pct) * 100) / 100;
      $("cd" + i).textContent = (d > 0 ? "+" : "") + d + "%"; $("cd" + i).style.color = d < 0 ? "var(--seal)" : d > 0 ? "var(--green)" : "";
      if (val) $("cv" + i).textContent = money(Math.round(val * v / 100));
    });
    sum = Math.round(sum * 100) / 100;
    $("cSum").innerHTML = Math.abs(sum - 100) < 0.05 ? `<span class="pill ok">Tổng 100%</span> Ghi đúng tỷ lệ này vào văn bản thỏa thuận phân chia di sản, tất cả người thừa kế cùng ký.` : `<span class="pill bad">Tổng ${sum}%</span> Tổng phải bằng 100%.`;
  };
  box.addEventListener("input", upd); upd();
}
