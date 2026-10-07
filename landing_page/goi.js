/* Phần dùng chung của các gói báo cáo trả phí (thuake.html, sodo.html).
   Trang gọi goiInit({pkg, demoId, openTool(saved), buildInput()}). Cách tính nằm trên máy chủ, không ở đây. */
const $ = id => document.getElementById(id);
const LOCAL_DEV = !CONFIG.ENDPOINT && (location.protocol === "file:" || /^(localhost|127\.0\.0\.1)$/.test(location.hostname));
const normPhone = s => { s = String(s || "").replace(/\D/g, ""); return s.startsWith("84") && s.length === 11 ? "0" + s.slice(2) : s; };
let GOI = null, ORDER = null, devEngine = false;

async function loadDev(){
  if (devEngine) return;
  for (const f of ["ThuaKe.gs", "SoDo.gs"]) await new Promise((ok, bad) => { const s = document.createElement("script"); s.src = "../landing_page_backend/apps-script/" + f; s.onload = ok; s.onerror = () => bad(new Error("Không tải được bộ máy tính chạy thử")); document.head.appendChild(s); });
  devEngine = true;
}
async function call(action, payload){
  if (CONFIG.ENDPOINT) return api(action, payload);
  if (!LOCAL_DEV) throw new Error("Trang đang hoàn thiện, vui lòng gọi hotline " + CONFIG.PHONE + ".");
  if (action === "tk_order") return {ok:true, id:GOI.demoId, amount:100000, transfer:"VMP " + GOI.demoId + " " + normPhone(payload.phone)};
  if (action === "tk_status"){
    if (String(payload.id).toUpperCase() !== GOI.demoId) throw new Error("Mã hoặc số điện thoại không đúng");
    return {ok:true, id:GOI.demoId, name:"Khách chạy thử", paid:true, expired:false, expires:new Date(Date.now() + 30 * 864e5).toISOString()};
  }
  if (action === "tk_run"){
    await loadDev();
    const who = {id:GOI.demoId, name:"Khách chạy thử", phone:normPhone(payload.phone)};
    const out = GOI.pkg === "sodo" ? sdReport(payload.input, who) : tkReport(payload.input, who);
    return {ok:true, html:out.html, heirs:out.heirs};
  }
}

function goiInit(cfg){
  GOI = cfg;
  document.querySelectorAll("[data-cfg]").forEach(el => el.textContent = CONFIG[el.dataset.cfg]);
  document.querySelectorAll("a.tel").forEach(a => a.href = "tel:" + CONFIG.PHONE.replace(/\D/g, ""));
  if (!CONFIG.ENDPOINT){
    $("draft").hidden = false;
    $("draft").textContent = LOCAL_DEV ? `Chạy thử trên máy: dùng mã ${cfg.demoId}, số điện thoại bất kỳ. Chưa nhận thanh toán thật.` : "Trang đang hoàn thiện: chưa nhận thanh toán trực tuyến. Vui lòng gọi hotline.";
  }

  /* Bước 1: mua */
  $("bGo").onclick = async () => {
    const name = $("bName").value.trim(), phone = normPhone($("bPhone").value), email = $("bEmail").value.trim(), out = $("buyOut");
    if (!name || !/^0\d{9}$/.test(phone)){ out.innerHTML = `<p class="errmsg">Nhập họ tên và số điện thoại 10 số.</p>`; return; }
    $("bGo").disabled = true; out.innerHTML = `<p class="muted">Đang tạo mã…</p>`;
    try {
      const r = await call("tk_order", {name, phone, email, pkg:cfg.pkg});
      const qr = bankReady() ? `https://img.vietqr.io/image/${encodeURIComponent(BANK.bankId)}-${encodeURIComponent(BANK.account.replace(/\s/g, ""))}-compact2.png?amount=${r.amount}&addInfo=${encodeURIComponent(r.transfer)}&accountName=${encodeURIComponent(BANK.holder.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "D").toUpperCase())}` : "";
      out.innerHTML = `<div class="pay">${qr ? `<img src="${qr}" alt="Mã QR chuyển khoản ${money(r.amount)}">` : ""}
        <div style="display:grid;gap:12px">
          <p class="okmsg">Mã đơn của anh chị: <b class="mono">${esc(r.id)}</b>. Quét mã QR bằng app ngân hàng, số tiền và nội dung đã điền sẵn.</p>
          <div class="kv">
            <span>Ngân hàng</span><b>${esc(BANK.bankName)}</b><span></span>
            <span>Số tài khoản</span><b class="mono">${esc(BANK.account)}</b><button type="button" class="btn ghost small" data-copy="${esc(BANK.account.replace(/\s/g, ""))}">Sao chép</button>
            <span>Chủ tài khoản</span><b>${esc(BANK.holder)}</b><span></span>
            <span>Số tiền</span><b>${money(r.amount)}</b><span></span>
            <span>Nội dung</span><b style="color:var(--seal)">${esc(r.transfer)}</b><button type="button" class="btn ghost small" data-copy="${esc(r.transfer)}">Sao chép</button>
          </div>
          <p class="muted" style="font-size:.9rem">Chuyển xong, bên em gửi link qua Zalo số ${esc(phone)}${email ? " và email" : ""}, thường trong 30 phút (giờ làm việc). Cần nhanh: nhắn Zalo kèm ảnh chuyển khoản.</p>
          <div class="ctas" style="margin-top:0"><a class="btn ghost" target="_blank" rel="noopener" href="https://zalo.me/${CONFIG.ZALO.replace(/\D/g, "")}">Nhắn Zalo báo đã chuyển</a></div>
        </div></div>`;
      $("uMa").value = r.id; $("uPhone").value = phone;
    } catch(e){ out.innerHTML = `<p class="errmsg">${esc(e.message)}</p>`; }
    $("bGo").disabled = false;
  };
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-copy]"); if (!b) return;
    navigator.clipboard && navigator.clipboard.writeText(b.dataset.copy).then(() => { const t = b.textContent; b.textContent = "Đã chép"; setTimeout(() => b.textContent = t, 1500); });
  });

  /* Bước 2: mở báo cáo */
  $("uGo").onclick = async () => {
    const id = $("uMa").value.trim().toUpperCase(), phone = normPhone($("uPhone").value), out = $("useOut");
    if (!id || !/^0\d{9}$/.test(phone)){ out.innerHTML = `<p class="errmsg">Nhập mã và số điện thoại 10 số.</p>`; return; }
    out.innerHTML = `<p class="muted">Đang kiểm tra…</p>`;
    try {
      const r = await call("tk_status", {id, phone});
      if (r.pkg && r.pkg !== cfg.pkg){ out.innerHTML = `<p class="errmsg">Mã ${esc(r.id)} dùng cho gói khác. <a href="${r.pkg === "sodo" ? "sodo.html" : "thuake.html"}?ma=${esc(r.id)}">Mở đúng trang</a>.</p>`; return; }
      if (!r.paid){ out.innerHTML = `<p class="errmsg">Đơn ${esc(r.id)} chưa được xác nhận thanh toán. Nếu đã chuyển khoản, chờ ít phút hoặc nhắn Zalo ${esc(CONFIG.ZALO)} kèm ảnh chuyển khoản.</p>`; return; }
      if (r.expired){ out.innerHTML = `<p class="errmsg">Mã đã hết hạn. Gọi ${esc(CONFIG.PHONE)} để gia hạn.</p>`; return; }
      ORDER = {id, phone, name:r.name, expires:r.expires};
      try { sessionStorage.setItem("goi_order", JSON.stringify(ORDER)); } catch(e){}
      out.innerHTML = `<p class="okmsg">Đã mở. Dùng đến ngày ${new Date(r.expires).toLocaleDateString("vi-VN")}.</p>`;
      $("tool").hidden = false; $("toolWho").textContent = "Báo cáo của " + (ORDER.name || "") + " · mã " + ORDER.id;
      cfg.openTool(r.saved);
      $("tool").scrollIntoView({behavior:"smooth"});
    } catch(e){ out.innerHTML = `<p class="errmsg">${esc(e.message)}</p>`; }
  };

  /* Xem báo cáo */
  $("runBtn").onclick = async () => {
    if (!ORDER) return;
    $("runBtn").disabled = true; $("runMsg").textContent = "Đang lập báo cáo…";
    try {
      const input = cfg.buildInput();
      const r = await call("tk_run", {id:ORDER.id, phone:ORDER.phone, input});
      $("tkResult").innerHTML = r.html; $("printBtn").hidden = false; $("runMsg").textContent = "";
      initCustom(+input.value || 0);
      $("tkResult").scrollIntoView({behavior:"smooth"});
    } catch(e){ $("runMsg").textContent = ""; $("tkResult").innerHTML = `<p class="errmsg">${esc(e.message)}</p>`; }
    $("runBtn").disabled = false;
  };
  $("printBtn").onclick = () => window.print();

  /* Mở từ link ?ma=… */
  const ma = new URLSearchParams(location.search).get("ma");
  let saved = null; try { saved = JSON.parse(sessionStorage.getItem("goi_order") || "null"); } catch(e){}
  if (ma){ $("uMa").value = ma.toUpperCase(); if (saved && saved.id === ma.toUpperCase()) $("uPhone").value = saved.phone; $("dung").scrollIntoView(); if ($("uPhone").value) $("uGo").click(); else $("uPhone").focus(); }
}
const goiStoreKey = () => "goi_state_" + (ORDER ? ORDER.id : "x");
function goiSave(state){ try { localStorage.setItem(goiStoreKey(), JSON.stringify(state)); } catch(e){} }
function goiLoad(){ try { return JSON.parse(localStorage.getItem(goiStoreKey()) || "null"); } catch(e){ return null; } }

/* Bảng tự chọn tỷ lệ (chỉ là phép cộng, không chứa cách tính) */
function initCustom(val){
  const box = document.getElementById("tkCustom"); if (!box) return;
  let heirs = []; try { heirs = JSON.parse(box.dataset.heirs); } catch(e){ return; }
  box.innerHTML = `<div class="table-box cust"><table><thead><tr><th>Người</th><th>Theo luật</th><th>Gia đình muốn chia (%)</th><th>Chênh lệch</th>${val ? "<th>Giá trị</th>" : ""}</tr></thead><tbody>
    ${heirs.map((h, i) => `<tr><td>${esc(h.who)}</td><td class="mono">${String(h.pct).replace(".", ",")}%</td><td><input type="number" min="0" max="100" step="0.1" data-ci="${i}" value="${h.pct}"></td><td class="mono" id="cd${i}">0</td>${val ? `<td class="mono" id="cv${i}"></td>` : ""}</tr>`).join("")}
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
