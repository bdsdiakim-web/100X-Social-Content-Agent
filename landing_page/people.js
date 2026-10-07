/* ============================================================
   SƠ ĐỒ THỪA KẾ (dịch vụ 01) và NGƯỜI LIÊN QUAN (các dịch vụ khác)
   Căn cứ: Bộ luật Dân sự 2015 — Điều 613 (người thừa kế), Điều 619 (chết cùng thời điểm),
   Điều 644 (người thừa kế không phụ thuộc di chúc), Điều 651 (hàng thừa kế), Điều 652 (thừa kế thế vị),
   Điều 653 (con nuôi).
   ============================================================ */

const MISS_REASONS = ["Đang giữ, chưa gửi", "Bị mất, cần xin lại", "Chưa từng làm giấy này", "Người đó ở xa, ở nước ngoài",
  "Không liên lạc được", "Người đó không hợp tác", "Không biết thông tin", "Khác"];

/* Giấy tờ theo từng người */
const PDOC = {
  cccd:{label:"Căn cước / CCCD", why:"Xác định nhân thân người ký hồ sơ.", where:"Bản gốc để đối chiếu. Mất thẻ thì làm lại ở công an xã, phường."},
  khaitu:{label:"Trích lục khai tử", why:"Chứng minh người này đã mất và thời điểm mất, quyết định ai được hưởng thừa kế.", where:"UBND xã, phường nơi đã đăng ký khai tử. Chưa từng khai tử thì đăng ký khai tử (muộn) tại UBND xã, phường nơi người đó cư trú cuối cùng."},
  khaitu_old:{label:"Giấy tờ chứng minh đã mất (khai tử)", why:"Chứng minh người này mất TRƯỚC người để lại di sản nên không thuộc diện hưởng thừa kế.", where:"Trích lục khai tử tại UBND xã, phường. Mất đã lâu, không còn giấy tờ: bên em hướng dẫn xin xác nhận hoặc lập cam kết thay thế theo yêu cầu của văn phòng công chứng."},
  khaisinh:{label:"Giấy khai sinh", why:"Chứng minh quan hệ cha mẹ và con.", where:"Bản chính, hoặc xin trích lục khai sinh tại UBND xã, phường nơi đã đăng ký khai sinh."},
  connuoi:{label:"Giấy chứng nhận nuôi con nuôi", why:"Con nuôi hợp pháp được thừa kế như con đẻ (Điều 653).", where:"UBND xã, phường nơi đã đăng ký nuôi con nuôi cấp trích lục."},
  kethon:{label:"Giấy chứng nhận kết hôn", why:"Chứng minh quan hệ vợ chồng và tài sản chung.", where:"Bản chính, hoặc xin trích lục kết hôn tại UBND xã, phường nơi đã đăng ký kết hôn."},
  docthan:{label:"Xác nhận tình trạng hôn nhân", why:"Chứng minh người này độc thân, tài sản không phải tài sản chung vợ chồng.", where:"UBND xã, phường nơi cư trú."},
  lyhon:{label:"Quyết định hoặc bản án ly hôn", why:"Xác định tài sản đã chia hay chưa, ai có quyền ký.", where:"Tòa án đã giải quyết ly hôn cấp bản sao."},
  khaitu_vc:{label:"Trích lục khai tử của vợ/chồng", why:"Vợ/chồng đã mất thì phần tài sản chung của họ phải làm thừa kế trước khi giao dịch.", where:"UBND xã, phường nơi đã đăng ký khai tử."},
  uyquyen:{label:"Văn bản ủy quyền", why:"Người ở xa, ở nước ngoài không trực tiếp ký được thì ủy quyền cho người khác.", where:"Công chứng tại Việt Nam, hoặc tại cơ quan đại diện Việt Nam ở nước ngoài."},
  _info:{label:"Thông tin sơ đồ thừa kế", why:"Cần biết bố, mẹ, ông bà và tất cả các con còn sống hay đã mất để xác định đúng người thừa kế.", where:"Điền ở phần Sơ đồ thừa kế trong phiếu."}
};

/* ---------- Phân số ---------- */
const _gcd = (a, b) => { a = Math.abs(a); b = Math.abs(b); while (b) [a, b] = [b, a % b]; return a || 1; };
const Fr = (n, d = 1) => { const g = _gcd(n, d); return {n: n / g, d: d / g}; };
const fAdd = (x, y) => Fr(x.n * y.d + y.n * x.d, x.d * y.d);
const fDiv = (x, k) => Fr(x.n, x.d * k);
const fStr = x => !x || x.n === 0 ? "0" : x.d === 1 ? String(x.n) : x.n + "/" + x.d;
const fPct = x => { const v = x.n / x.d * 100; return (Math.round(v * 10) / 10).toLocaleString("vi-VN") + "%"; };

/* ============================================================
   SƠ ĐỒ THỪA KẾ
   ============================================================ */
const FREL = {A:"Bố", B:"Mẹ", pgf:"Ông nội", pgm:"Bà nội", mgf:"Ông ngoại", mgm:"Bà ngoại"};

function famNew(){
  return {owners:"both", married:"yes", seq:0,
    people:["A", "B", "pgf", "pgm", "mgf", "mgm"].map(id => ({id, rel:id, name:"", status:"", docs:{}}))};
}
const famGet = (f, id) => f.people.find(p => p.id === id);
const famKids = f => f.people.filter(p => p.rel === "child");

function pLabel(f, p){
  if (FREL[p.rel]) return FREL[p.rel];
  if (p.rel === "child") return "Con thứ " + (famKids(f).indexOf(p) + 1) + (p.type === "nuoi" ? " (con nuôi)" : p.of === "A" ? " (con riêng của bố)" : p.of === "B" ? " (con riêng của mẹ)" : "");
  const par = famGet(f, p.parent), pn = par ? (par.name || pLabel(f, par)) : "";
  if (p.rel === "cspouse") return "Vợ/chồng của " + pn;
  if (p.rel === "gchild") return "Con của " + pn;
  return "";
}
const pWho = (f, p) => p.name ? `${p.name} (${pLabel(f, p)})` : pLabel(f, p);

function _year(p){ return +p.deathYear || (p.deathDate ? +p.deathDate.slice(0, 4) : 0); }
/* <0: p mất trước q; >0: p mất sau q; 0: cùng lúc/không phân biệt được; NaN: thiếu thông tin */
function dcmp(p, q){
  if (p.deathDate && q.deathDate) return p.deathDate < q.deathDate ? -1 : p.deathDate > q.deathDate ? 1 : 0;
  const py = _year(p), qy = _year(q);
  if (!py || !qy) return NaN;
  return py < qy ? -1 : py > qy ? 1 : 0;
}
/* Tình trạng của p vào lúc x mất */
function stAt(p, x){
  if (p.status === "alive") return "alive";
  if (p.status !== "dead") return "unknown";
  const c = dcmp(p, x);
  if (isNaN(c)) return "unknown";
  return c < 0 ? "before" : c > 0 ? "after" : "same";
}
function spouseOf(f, x){
  if (x.rel === "A") return f.married === "yes" ? [famGet(f, "B")] : [];
  if (x.rel === "B") return f.married === "yes" ? [famGet(f, "A")] : [];
  if (x.rel === "child") return f.people.filter(p => p.rel === "cspouse" && p.parent === x.id);
  return [];
}
function parentsOf(f, x){
  if (x.rel === "A") return [famGet(f, "pgf"), famGet(f, "pgm")];
  if (x.rel === "B") return [famGet(f, "mgf"), famGet(f, "mgm")];
  if (x.rel === "child") return (x.of === "A" ? ["A"] : x.of === "B" ? ["B"] : ["A", "B"]).map(id => famGet(f, id));
  return [];
}
function childrenOf(f, x){
  if (x.rel === "A") return f.people.filter(p => p.rel === "child" && p.of !== "B");
  if (x.rel === "B") return f.people.filter(p => p.rel === "child" && p.of !== "A");
  if (x.rel === "child") return f.people.filter(p => p.rel === "gchild" && p.parent === x.id);
  return [];
}
const trackable = x => ["A", "B", "child"].includes(x.rel);

/* Phân tích: ai hưởng, bao nhiêu, theo trình tự thời gian */
function famAnalyze(f){
  const est = {}, role = {}, log = [], pending = [], warn = [];
  const add = (id, x) => est[id] = est[id] ? fAdd(est[id], x) : x;
  const A = famGet(f, "A"), B = famGet(f, "B");
  const setRole = (id, r) => { if (role[id] !== "dec") role[id] = r; };

  if (f.owners === "both"){ add("A", Fr(1, 2)); add("B", Fr(1, 2)); }
  else if (f.owners === "A") add("A", Fr(1));
  else add("B", Fr(1));

  [A, B].forEach(p => {
    if (!p.status) warn.push(`Chọn ${FREL[p.rel].toLowerCase()} còn sống hay đã mất.`);
    else if (p.status === "dead" && !_year(p)) warn.push(`Ghi năm mất của ${FREL[p.rel].toLowerCase()}.`);
  });
  if (A.status === "dead" && B.status === "dead" && f.married === "yes" && dcmp(A, B) === 0)
    warn.push("Bố và mẹ mất cùng năm: cần ghi ngày mất chính xác để biết ai mất trước. Nếu không xác định được, hai người không được thừa kế của nhau (Điều 619).");
  if (!famKids(f).length) warn.push("Thêm tất cả các con: kể cả con đã mất, con riêng, con nuôi.");
  const owners = f.owners === "both" ? [A, B] : f.owners === "A" ? [A] : [B];
  if (owners.every(p => p.status === "alive")) warn.push("Người đứng tên sổ còn sống nên chưa phát sinh thừa kế.");

  const queue = f.people.filter(p => trackable(p) && p.status === "dead")
    .sort((p, q) => { const c = dcmp(p, q); return isNaN(c) ? (_year(p) ? -1 : 1) : c; });
  const done = new Set();

  for (let guard = 0; guard < 60; guard++){
    const x = queue.find(p => !done.has(p.id) && est[p.id] && est[p.id].n > 0);
    if (!x) break;
    done.add(x.id); role[x.id] = "dec";
    const amt = est[x.id], who = pWho(f, x), yr = x.deathDate ? new Date(x.deathDate).toLocaleDateString("vi-VN") : (_year(x) || "?");
    if (x.will === "Có"){
      pending.push(`Phần của ${who} (${fStr(amt)}) chia theo di chúc. Lưu ý: cha, mẹ, vợ/chồng, con chưa thành niên hoặc con không có khả năng lao động vẫn được hưởng ít nhất 2/3 suất theo pháp luật (Điều 644).`);
      continue;
    }
    if (x.will === "Chưa rõ") warn.push(`Chưa rõ ${who} có để lại di chúc không. Bảng dưới đang tạm tính theo pháp luật (không có di chúc).`);

    const slots = [];
    const takeSlot = (p, kind) => {
      if (!p) return;
      const s = stAt(p, x);
      if (s === "alive") slots.push({p, t:"heir"});
      else if (s === "after") slots.push({p, t:"trans"});
      else if (s === "unknown") slots.push({p, t:"unk"});
      else if (s === "same"){ setRole(p.id, "excl"); warn.push(`${pWho(f, p)} và ${who} mất cùng năm, chưa rõ ai mất trước. Cần ngày mất chính xác (Điều 619).`); }
      else if (kind === "child"){
        const gk = childrenOf(f, p).filter(g => { const sg = stAt(g, x); return sg !== "before" && sg !== "same"; });
        if (gk.length) slots.push({p, t:"rep", reps:gk});
        else {
          setRole(p.id, "excl");
          if (!childrenOf(f, p).length) warn.push(`${pWho(f, p)} mất trước ${who}. Nếu người này có con, các cháu được hưởng thay phần của cha/mẹ mình (thừa kế thế vị, Điều 652): bấm "Thêm cháu" dưới người con này.`);
        }
      } else setRole(p.id, "excl");
    };
    spouseOf(f, x).forEach(p => takeSlot(p, "spouse"));
    parentsOf(f, x).forEach(p => takeSlot(p, "parent"));
    childrenOf(f, x).forEach(p => takeSlot(p, "child"));

    if (!slots.length){
      pending.push(`${who} không còn ai ở hàng thừa kế thứ nhất: phần ${fStr(amt)} chia cho hàng thứ hai (ông bà, anh chị em ruột của ${who}). Bên em sẽ tư vấn thêm.`);
      continue;
    }
    const each = fDiv(amt, slots.length);
    log.push(`${yr}: ${who} mất. Phần di sản ${fStr(amt)} chia đều cho ${slots.length} suất hàng thừa kế thứ nhất, mỗi suất ${fStr(each)}: ${slots.map(s => pWho(f, s.p) + (s.t === "rep" ? " (đã mất trước, các con hưởng thế vị)" : s.t === "trans" ? " (mất sau, phần chuyển tiếp)" : s.t === "unk" ? " (chưa rõ còn sống)" : "")).join("; ")}.`);
    slots.forEach(s => {
      if (s.t === "heir"){ add(s.p.id, each); setRole(s.p.id, "heir"); }
      else if (s.t === "unk"){ add(s.p.id, each); setRole(s.p.id, "unk"); }
      else if (s.t === "trans"){
        setRole(s.p.id, "trans");
        if (trackable(s.p)) add(s.p.id, each);
        else if (["pgf", "pgm", "mgf", "mgm"].includes(s.p.rel)) pending.push(`${pWho(f, s.p)} mất sau ${who}: phần ${fStr(each)} của ${pLabel(f, s.p).toLowerCase()} chuyển cho những người thừa kế của ${pLabel(f, s.p).toLowerCase()}, gồm các con còn lại (bác, chú, cô, cậu, dì) và các cháu hưởng thế vị phần của ${who}. Cần thêm thông tin các anh chị em của ${FREL[s.p.rel[0] === "p" ? "A" : "B"].toLowerCase()}.`);
        else pending.push(`${pWho(f, s.p)} mất sau ${who}: phần ${fStr(each)} của người này chuyển cho những người thừa kế của họ (cần thêm thông tin).`);
      } else if (s.t === "rep"){
        setRole(s.p.id, "excl");
        const e2 = fDiv(each, s.reps.length);
        s.reps.forEach(g => {
          const sg = stAt(g, x);
          if (sg === "after"){ setRole(g.id, "trans"); pending.push(`${pWho(f, g)} mất sau ${who}: phần ${fStr(e2)} chuyển cho người thừa kế của cháu (cần thêm thông tin).`); }
          else { add(g.id, e2); setRole(g.id, sg === "unknown" ? "unk" : "rep"); }
        });
      }
    });
  }

  const final = {};
  f.people.forEach(p => { if (est[p.id] && est[p.id].n > 0 && role[p.id] !== "dec" && !(role[p.id] === "trans" && trackable(p))) final[p.id] = est[p.id]; });
  f.people.forEach(p => { if (!role[p.id] && relevant(f, p)) role[p.id] = p.status === "" ? "unk" : "none"; });
  f.people.forEach(p => { if (p.abroad && p.status === "alive" && final[p.id]) warn.push(`${pWho(f, p)} đang ở nước ngoài: cần về ký hoặc làm văn bản ủy quyền tại cơ quan đại diện Việt Nam.`); });
  return {final, role, log, pending, warn};
}

/* Người nào cần xuất hiện trong sơ đồ */
function relevant(f, p){
  if (p.rel === "A" || p.rel === "B" || p.rel === "child") return true;
  if (p.rel === "pgf" || p.rel === "pgm") return famGet(f, "A").status === "dead";
  if (p.rel === "mgf" || p.rel === "mgm") return famGet(f, "B").status === "dead";
  const par = famGet(f, p.parent);
  return !!par && par.status === "dead";
}

/* Giấy tờ cần của từng người trong sơ đồ: [key, need, labelOverride] */
function famDocs(f, p, ana){
  if (!relevant(f, p)) return [];
  const r = ana.role[p.id], out = [];
  const alive = p.status === "alive", dead = p.status === "dead";
  if (p.rel === "A" || p.rel === "B"){
    if (dead) out.push(["khaitu", 1]);
    if (alive) out.push(["cccd", 1]);
    if (p.rel === "A" && f.married === "yes" && (dead || famGet(f, "B").status === "dead")) out.push(["kethon", 1, "Giấy chứng nhận kết hôn của bố mẹ"]);
  } else if (["pgf", "pgm", "mgf", "mgm"].includes(p.rel)){
    if (dead) out.push(r === "excl" ? ["khaitu_old", 1] : ["khaitu", 1]);
    if (alive) out.push(["cccd", 1]);
  } else if (p.rel === "child"){
    out.push(p.type === "nuoi" ? ["connuoi", 1] : ["khaisinh", 1, "Giấy khai sinh (chứng minh là con của bố/mẹ)"]);
    if (alive) out.push(["cccd", 1]);
    if (dead) out.push(["khaitu", 1]);
  } else if (p.rel === "cspouse"){
    if (ana.role[p.parent] !== "trans") return []; // con mất trước: vợ/chồng của con không hưởng, không cần giấy tờ
    out.push(["kethon", 1, "Giấy chứng nhận kết hôn với " + (famGet(f, p.parent)?.name || "người con đã mất")]);
    if (alive) out.push(["cccd", 1]);
    if (dead) out.push(["khaitu", 1]);
  } else if (p.rel === "gchild"){
    out.push(["khaisinh", 1, "Giấy khai sinh (chứng minh là con của " + (famGet(f, p.parent)?.name || "người con đã mất") + ")"]);
    if (alive) out.push(["cccd", 2, "Căn cước / CCCD (nếu đã đủ tuổi)"]);
    if (dead) out.push(["khaitu", 1]);
  }
  if (p.abroad && alive) out.push(["uyquyen", 2]);
  return out;
}

/* ============================================================
   NGƯỜI LIÊN QUAN (các dịch vụ khác)
   ============================================================ */
/* [khóa vai trò, tên vai trò, tùy chọn]: marital = hỏi tình trạng hôn nhân (1 bắt buộc, 2 tùy trường hợp),
   add = thêm được nhiều người, neighbor = hộ giáp ranh, nodocs = không cần giấy tờ */
const PARTY_TPL = {
  2:[["owner", "Người sử dụng đất", {marital:1}], ["member", "Thành viên khác cùng sử dụng đất", {add:1}]],
  3:[["seller", "Bên chuyển (bên bán, bên tặng cho)", {marital:1, add:1}], ["buyer", "Bên nhận", {marital:2, add:1}]],
  4:[["owner", "Người đứng tên sổ", {marital:1, add:1}]],
  5:[["owner", "Chủ đất", {}], ["neighbor", "Hộ giáp ranh", {add:1, neighbor:1}]],
  8:[["owner", "Người đứng tên sổ", {marital:1, add:1}]],
  9:[["owner", "Chủ nhà, chủ đầu tư", {marital:1}]],
  11:[["seller", "Bên bán", {marital:1, add:1}], ["buyer", "Bên mua", {marital:2, add:1}]],
  13:[["lessor", "Bên cho thuê", {}], ["lessee", "Bên thuê", {}]],
  14:[["req", "Người yêu cầu lập vi bằng", {}], ["other14", "Bên liên quan", {add:1, nodocs:1}]],
  15:[["signer", "Người ký văn bản công chứng", {marital:1, add:1}]],
  16:[["me", "Bên anh chị", {}], ["opp", "Bên tranh chấp", {add:1, nodocs:1}]]
};
const MARITAL = ["Đã kết hôn", "Độc thân", "Đã ly hôn", "Vợ/chồng đã mất"];

function partyRoles(services){
  const s = new Set(services), out = [], seen = new Set();
  services.forEach(no => {
    if (no === 3 && s.has(1)) return;
    if (no === 15 && (s.has(1) || s.has(3) || s.has(11))) return;
    (PARTY_TPL[no] || []).forEach(([k, label, o]) => { if (!seen.has(k)){ seen.add(k); out.push({k, label, o, svc:no}); } });
  });
  return out;
}
const partyNew = () => ({name:"", phone:"", status:"alive", marital:"", abroad:false, docs:{}, spouse:{name:"", docs:{}}});

function partyDocs(role, p){
  const o = role.o, out = [], sp = [];
  if (o.nodocs || o.neighbor) return {out, sp};
  if (p.status === "dead") out.push(["khaitu", 1]); else out.push(["cccd", 1]);
  if (p.abroad && p.status !== "dead") out.push(["uyquyen", 2]);
  if (o.marital){
    const need = o.marital;
    if (p.marital === "Đã kết hôn"){ out.push(["kethon", need]); sp.push(["cccd", need, "Căn cước / CCCD của vợ/chồng"]); }
    else if (p.marital === "Độc thân") out.push(["docthan", need]);
    else if (p.marital === "Đã ly hôn") out.push(["lyhon", need]);
    else if (p.marital === "Vợ/chồng đã mất") sp.push(["khaitu_vc", 1]);
  }
  return {out, sp};
}

/* ============================================================
   Gộp giấy tờ theo người vào danh sách chung (dùng trong evaluate)
   ============================================================ */
function peopleDocs(r){
  const svcs = r.services || [], all = r.allServices || svcs, out = [];
  const mk = (id, key, need, label, who, st, svc) => {
    const d = PDOC[key];
    out.push({id, name: `${label || d.label} – ${who}`, need, why: d.why, where: d.where, notes: [], services: [svc],
      state: st && st.s === "co" ? "co" : st && st.s === "nop" ? "nop" : st && st.s === "chua" ? "chua" : st && st.s === "ko" ? "ko" : "", reason: st ? st.r || "" : "", person: who});
  };
  if (svcs.includes(1)){
    const f = r.family;
    const filled = f && famGet(f, "A").status && famGet(f, "B").status && famKids(f).length;
    if (!filled) mk("f|_|_info", "_info", 1, "", "sơ đồ thừa kế chưa điền đủ", null, 1);
    if (f){
      const ana = famAnalyze(f);
      f.people.forEach(p => famDocs(f, p, ana).forEach(([key, need, label]) => mk(`f|${p.id}|${key}`, key, need, label, pWho(f, p), p.docs[key], 1)));
    }
  }
  const parties = r.parties || {};
  partyRoles(all).filter(role => svcs.includes(role.svc)).forEach(role => {
    (parties[role.k] || []).forEach((p, i) => {
      const who = (p.name || "(chưa ghi tên)") + " – " + role.label.toLowerCase() + ((parties[role.k].length > 1) ? " " + (i + 1) : "");
      const {out: ds, sp} = partyDocs(role, p);
      ds.forEach(([key, need, label]) => mk(`q|${role.k}|${i}|${key}`, key, need, label, who, p.docs[key], role.svc));
      sp.forEach(([key, need, label]) => mk(`qs|${role.k}|${i}|${key}`, key, need, label, (p.spouse.name ? p.spouse.name + ", " : "") + "vợ/chồng của " + (p.name || role.label.toLowerCase()), p.spouse.docs[key], role.svc));
    });
  });
  return out;
}
/* Trang quản lý đổi trạng thái giấy tờ của một người */
function setPersonDoc(r, id, s){
  const parts = id.split("|");
  if (parts[0] === "f"){ const p = r.family && famGet(r.family, parts[1]); if (p) p.docs[parts[2]] = {...(p.docs[parts[2]] || {}), s}; }
  if (parts[0] === "q" || parts[0] === "qs"){
    const p = ((r.parties || {})[parts[1]] || [])[+parts[2]];
    if (p){ const tgt = parts[0] === "qs" ? p.spouse.docs : p.docs; tgt[parts[3]] = {...(tgt[parts[3]] || {}), s}; }
  }
}

/* ============================================================
   GIAO DIỆN — dùng chung cho trang khách hàng và trang quản lý
   ============================================================ */
const ROLE_TXT = {dec:"Người để lại di sản", heir:"Được thừa kế", trans:"Mất sau – phần chuyển tiếp", excl:"Mất trước – không hưởng", rep:"Hưởng thế vị", unk:"Chưa rõ", none:""};
const stTxt = p => p.status === "alive" ? "Còn sống" : p.status === "dead" ? "Mất " + (p.deathDate ? new Date(p.deathDate).toLocaleDateString("vi-VN") : (p.deathYear || "?")) : "Chưa rõ còn sống";

function famTreeHtml(f, ana){
  const node = p => {
    if (!p) return "";
    const rel = relevant(f, p), r = ana.role[p.id] || "none";
    const docs = famDocs(f, p, ana), miss = docs.filter(([k, n]) => n === 1 && !["co", "nop"].includes((p.docs[k] || {}).s)).length;
    return `<div class="fnode r-${rel ? r : "off"}">
      <span class="fr">${esc(pLabel(f, p))}</span>
      <b>${esc(p.name || "(chưa ghi tên)")}</b>
      <span class="fs">${esc(stTxt(p))}</span>
      ${rel && ROLE_TXT[r] ? `<span class="frole">${ROLE_TXT[r]}</span>` : ""}
      ${rel && docs.length ? `<span class="fdoc ${miss ? "bad" : "ok"}">${miss ? "Thiếu " + miss + " giấy tờ" : "Đủ giấy tờ"}</span>` : ""}
      ${!rel ? `<span class="fs">Chỉ cần khi ${p.rel[0] === "p" ? "bố" : "mẹ"} đã mất</span>` : ""}
    </div>`;
  };
  const kids = famKids(f);
  return `<div class="ftree" role="group" aria-label="Sơ đồ thừa kế">
    <div class="fgen"><span class="fgl">Đời ông bà</span><div class="frow">
      <div class="fside"><span class="fsl">Bên nội (bố mẹ của bố)</span><div class="fpair">${node(famGet(f, "pgf"))}${node(famGet(f, "pgm"))}</div></div>
      <div class="fside"><span class="fsl">Bên ngoại (bố mẹ của mẹ)</span><div class="fpair">${node(famGet(f, "mgf"))}${node(famGet(f, "mgm"))}</div></div>
    </div></div>
    <div class="fgen"><span class="fgl">Đời bố mẹ · sổ đứng tên ${f.owners === "both" ? "bố và mẹ" : f.owners === "A" ? "bố" : "mẹ"}</span><div class="frow"><div class="fpair">${node(famGet(f, "A"))}<span class="fmar">${f.married === "yes" ? "vợ chồng" : "không còn là vợ chồng"}</span>${node(famGet(f, "B"))}</div></div></div>
    <div class="fgen"><span class="fgl">Đời con</span><div class="frow fkids">${kids.length ? kids.map(c => {
      const subs = f.people.filter(p => (p.rel === "cspouse" || p.rel === "gchild") && p.parent === c.id);
      return `<div class="fkid">${node(c)}${subs.length ? `<div class="fsub"><span class="fgl">Gia đình của ${esc(c.name || pLabel(f, c))}</span>${subs.map(node).join("")}</div>` : ""}</div>`;
    }).join("") : '<p class="fempty">Chưa thêm người con nào.</p>'}</div></div>
    <div class="flegend"><span class="r-dec">Người để lại di sản</span><span class="r-heir">Được thừa kế</span><span class="r-rep">Thế vị</span><span class="r-trans">Mất sau, chuyển tiếp</span><span class="r-excl">Mất trước, không hưởng</span><span class="r-unk">Chưa rõ</span></div>
  </div>`;
}

function famResultHtml(f, ana){
  return `<div class="fres">
    ${ana.warn.length ? `<div class="fwarn"><b>Cần bổ sung thông tin</b><ul>${ana.warn.map(w => `<li>${esc(w)}</li>`).join("")}</ul></div>` : ""}
    <div class="fwarn" style="background:var(--green-soft);color:var(--green)"><b>Muốn biết mỗi người được bao nhiêu phần trăm?</b> Báo cáo riêng 100.000đ: phần trăm từng người theo hàng thừa kế 1, 2, 3, kiểm tra di chúc, giấy tờ còn thiếu, quy trình, thuế phí. <a href="thuake.html">Xem báo cáo thừa kế →</a></div>
  </div>`;
}

function famLawHtml(){
  return `<details class="flaw" open><summary>Hàng thừa kế theo pháp luật là gì? (bấm để thu gọn)</summary>
    <div class="flaw-b">
      <div class="fh h1"><b>Hàng thứ nhất</b><span>Vợ, chồng, cha đẻ, mẹ đẻ, cha nuôi, mẹ nuôi, con đẻ, con nuôi của người mất.</span></div>
      <div class="fh h2"><b>Hàng thứ hai</b><span>Ông bà nội, ông bà ngoại, anh chị em ruột của người mất; cháu ruột (người mất là ông, bà).</span></div>
      <div class="fh h3"><b>Hàng thứ ba</b><span>Cụ nội, cụ ngoại, bác, chú, cậu, cô, dì ruột; cháu ruột (người mất là bác, chú, cậu, cô, dì); chắt ruột.</span></div>
      <ul>
        <li>Những người cùng hàng hưởng phần bằng nhau. Hàng sau chỉ được hưởng khi không còn ai ở hàng trước (Điều 651 Bộ luật Dân sự 2015).</li>
        <li>Con mất trước hoặc cùng lúc với cha/mẹ thì các cháu hưởng phần mà cha/mẹ của cháu lẽ ra được hưởng: gọi là thừa kế thế vị (Điều 652).</li>
        <li>Người thừa kế mất SAU người để lại di sản vẫn được hưởng, phần đó chuyển tiếp cho những người thừa kế của chính họ.</li>
        <li>Ví dụ: sổ tên bố mẹ, bố mất năm 2000, mẹ mất năm 2002. Phần của bố chia cho mẹ, ông bà nội (nếu còn sống năm 2000) và các con. Sau đó phần của mẹ (gồm phần của mẹ và phần mẹ hưởng từ bố) chia cho ông bà ngoại (nếu còn sống năm 2002) và các con.</li>
      </ul>
    </div></details>`;
}

/* Hàng giấy tờ của một người, có chọn Có / Chưa có và lý do */
function pdocRow(attrs, name, key, need, label, st){
  st = st || {};
  const d = PDOC[key], s = st.s || "";
  const opt = (v, t, cls) => `<label><input type="radio" name="${name}" value="${v}" ${attrs} data-doc="${key}" class="${cls || ""}"${s === v ? " checked" : ""}><span>${t}</span></label>`;
  return `<div class="pdoc">
    <div class="pdoc-n"><b>${esc(label || d.label)}</b>${need === 1 ? "" : ' <span class="pill neutral">Tùy trường hợp</span>'}<small>${esc(d.why)}</small></div>
    <div class="seg">${opt("co", "Có")}${opt("chua", "Chưa có", "no")}</div>
    ${s === "chua" ? `<div class="pdoc-miss"><label class="f">Vì sao chưa có?<select ${attrs} data-doc="${key}" data-reason="1"><option value="">Chọn lý do</option>${MISS_REASONS.map(x => `<option${st.r === x ? " selected" : ""}>${esc(x)}</option>`).join("")}</select></label><small><b>Cách bổ sung:</b> ${esc(d.where)}</small></div>` : ""}
  </div>`;
}

/* Form nhập sơ đồ thừa kế (trang khách hàng) */
function famFormHtml(f){
  const ana = famAnalyze(f);
  const sel = (attrs, val, opts) => `<select ${attrs}>${opts.map(([v, t]) => `<option value="${v}"${val === v ? " selected" : ""}>${esc(t)}</option>`).join("")}</select>`;
  const card = (p) => {
    const a = `data-fp="${p.id}"`, rel = relevant(f, p);
    if (!rel) return "";
    const isKid = p.rel === "child", isSub = p.rel === "cspouse" || p.rel === "gchild";
    const docs = famDocs(f, p, ana);
    const subs = isKid ? f.people.filter(q => (q.rel === "cspouse" || q.rel === "gchild") && q.parent === p.id) : [];
    return `<div class="pcard${isSub ? " sub" : ""}" id="pc_${p.id}">
      <div class="pcard-h"><b>${esc(pLabel(f, p))}</b>${ana.role[p.id] && ROLE_TXT[ana.role[p.id]] ? `<span class="frole r-${ana.role[p.id]}">${ROLE_TXT[ana.role[p.id]]}</span>` : ""}${(isKid || isSub) ? `<button type="button" class="btn ghost small" data-fdel="${p.id}">Xóa</button>` : ""}</div>
      <div class="pgrid">
        <label class="f">Họ tên<input ${a} data-k="name" id="fp_${p.id}_name" value="${esc(p.name)}" placeholder="Nguyễn Văn ..."></label>
        <label class="f">Tình trạng${sel(`${a} data-k="status" id="fp_${p.id}_status"`, p.status, [["", "Chọn"], ["alive", "Còn sống"], ["dead", "Đã mất"]])}</label>
        ${p.status === "dead" ? `<label class="f">Năm mất<input ${a} data-k="deathYear" id="fp_${p.id}_dy" inputmode="numeric" maxlength="4" value="${esc(p.deathYear || "")}" placeholder="2000"></label>
          <label class="f">Ngày mất <span class="hint">nếu nhớ</span><input type="date" ${a} data-k="deathDate" id="fp_${p.id}_dd" value="${esc(p.deathDate || "")}"></label>` : ""}
        ${(p.rel === "A" || p.rel === "B") && p.status === "dead" ? `<label class="f">Có để lại di chúc?${sel(`${a} data-k="will" id="fp_${p.id}_will"`, p.will || "Không", [["Không", "Không"], ["Có", "Có"], ["Chưa rõ", "Chưa rõ"]])}</label>` : ""}
        ${isKid ? `<label class="f">Là${sel(`${a} data-k="type" id="fp_${p.id}_type"`, p.type || "de", [["de", "Con đẻ"], ["nuoi", "Con nuôi"]])}</label>
          <label class="f">Con của${sel(`${a} data-k="of" id="fp_${p.id}_of"`, p.of || "both", [["both", "Cả bố và mẹ"], ["A", "Chỉ của bố (con riêng)"], ["B", "Chỉ của mẹ (con riêng)"]])}</label>` : ""}
        ${p.status === "alive" ? `<label class="f">Đang ở${sel(`${a} data-k="abroad" id="fp_${p.id}_ab"`, p.abroad ? "1" : "", [["", "Trong nước"], ["1", "Nước ngoài"]])}</label>
          <label class="f">Số điện thoại <span class="hint">không bắt buộc</span><input ${a} data-k="phone" id="fp_${p.id}_ph" type="tel" value="${esc(p.phone || "")}"></label>` : ""}
      </div>
      ${docs.length ? `<div class="pdocs"><span class="sum-k">Giấy tờ của người này</span>${docs.map(([key, need, label]) => pdocRow(a, `fd_${p.id}_${key}`, key, need, label, p.docs[key])).join("")}</div>` : ""}
      ${isKid && p.status === "dead" ? `<div class="psubs"><p class="muted" style="font-size:.85rem">Người con này đã mất: thêm vợ/chồng và các con của người này (nếu có).</p>
        <div class="pcards">${subs.map(card).join("")}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn ghost small" data-fadd="cspouse" data-parent="${p.id}">+ Thêm vợ/chồng</button><button type="button" class="btn ghost small" data-fadd="gchild" data-parent="${p.id}">+ Thêm cháu</button></div></div>` : ""}
    </div>`;
  };
  return `${famLawHtml()}
    <div class="row2">
      <label class="f">Sổ đỏ đứng tên${sel(`data-ftop="owners" id="ft_owners"`, f.owners, [["both", "Cả bố và mẹ"], ["A", "Chỉ bố"], ["B", "Chỉ mẹ"]])}</label>
      <label class="f">Bố mẹ${sel(`data-ftop="married" id="ft_married"`, f.married, [["yes", "Là vợ chồng đến khi mất"], ["no", "Đã ly hôn / không đăng ký kết hôn"]])}</label>
    </div>
    <h4 class="fh4">Bố và mẹ</h4><div class="pcards">${card(famGet(f, "A"))}${card(famGet(f, "B"))}</div>
    ${relevant(f, famGet(f, "pgf")) || relevant(f, famGet(f, "mgf")) ? `<h4 class="fh4">Ông bà</h4><p class="muted" style="font-size:.85rem">Ông bà còn sống vào lúc bố/mẹ mất cũng được hưởng thừa kế. Mất trước thì cần giấy tờ chứng minh.</p>
      <div class="pcards">${["pgf", "pgm", "mgf", "mgm"].map(id => card(famGet(f, id))).join("")}</div>` : ""}
    <h4 class="fh4">Các con <span class="muted" style="font-weight:400">(ghi đủ tất cả, kể cả con đã mất, con riêng, con nuôi)</span></h4>
    <div class="pcards">${famKids(f).map(card).join("")}</div>
    <button type="button" class="btn ghost small" data-fadd="child">+ Thêm người con</button>
    <h4 class="fh4">Sơ đồ thừa kế của gia đình anh chị</h4>
    <div id="famTree">${famTreeHtml(f, ana)}${famResultHtml(f, ana)}</div>`;
}

/* Form người liên quan (trang khách hàng) */
function partyFormHtml(parties, roles){
  const sel = (attrs, val, opts) => `<select ${attrs}>${opts.map(v => `<option${val === v ? " selected" : ""}>${esc(v)}</option>`).join("")}</select>`;
  return roles.map(role => {
    const list = parties[role.k] || [];
    return `<div class="prole"><h4 class="fh4">${esc(role.label)}</h4>
      <div class="pcards">${list.map((p, i) => {
        const a = `data-q="${role.k}|${i}"`, as = `data-qs="${role.k}|${i}"`, {out, sp} = partyDocs(role, p);
        return `<div class="pcard"><div class="pcard-h"><b>${esc(role.label)}${list.length > 1 ? " " + (i + 1) : ""}</b>${(role.o.add && list.length > 1) || role.o.neighbor || role.o.nodocs ? `<button type="button" class="btn ghost small" data-qdel="${role.k}|${i}">Xóa</button>` : ""}</div>
          <div class="pgrid">
            <label class="f">Họ tên<input ${a} data-k="name" id="q_${role.k}_${i}_name" value="${esc(p.name)}"></label>
            <label class="f">Số điện thoại <span class="hint">không bắt buộc</span><input ${a} data-k="phone" id="q_${role.k}_${i}_ph" type="tel" value="${esc(p.phone)}"></label>
            ${role.o.neighbor ? `<label class="f">Giáp phía${sel(`${a} data-k="dir" id="q_${role.k}_${i}_dir"`, p.dir || "", ["", "Đông", "Tây", "Nam", "Bắc", "Khác"])}</label>
              <label class="f">Đã báo lịch đo?${sel(`${a} data-k="informed" id="q_${role.k}_${i}_inf"`, p.informed || "", ["", "Đã báo", "Chưa báo", "Không liên lạc được"])}</label>` : ""}
            ${!role.o.neighbor && !role.o.nodocs ? `<label class="f">Tình trạng${sel(`${a} data-k="status" id="q_${role.k}_${i}_st"`, p.status === "dead" ? "Đã mất" : "Còn sống", ["Còn sống", "Đã mất"])}</label>
              ${p.status !== "dead" ? `<label class="f">Đang ở${sel(`${a} data-k="abroad" id="q_${role.k}_${i}_ab"`, p.abroad ? "Nước ngoài" : "Trong nước", ["Trong nước", "Nước ngoài"])}</label>` : ""}
              ${role.o.marital && p.status !== "dead" ? `<label class="f">Tình trạng hôn nhân${sel(`${a} data-k="marital" id="q_${role.k}_${i}_mar"`, p.marital || "", ["", ...MARITAL])}</label>` : ""}` : ""}
            ${p.marital === "Đã kết hôn" || p.marital === "Vợ/chồng đã mất" ? `<label class="f">Họ tên vợ/chồng<input ${as} data-k="name" id="qs_${role.k}_${i}_name" value="${esc(p.spouse.name)}"></label>` : ""}
          </div>
          ${p.status === "dead" ? `<p class="fwarn" style="margin:0">Người này đã mất: phải làm thủ tục thừa kế phần của họ trước. Anh chị chọn thêm dịch vụ 01 để bên em lập sơ đồ thừa kế.</p>` : ""}
          ${p.marital === "Vợ/chồng đã mất" ? `<p class="fwarn" style="margin:0">Vợ/chồng đã mất: phần tài sản chung của người đó cần làm thừa kế trước khi giao dịch (dịch vụ 01).</p>` : ""}
          ${out.length || sp.length ? `<div class="pdocs"><span class="sum-k">Giấy tờ của người này</span>${out.map(([key, need, label]) => pdocRow(a, `qd_${role.k}_${i}_${key}`, key, need, label, p.docs[key])).join("")}${sp.map(([key, need, label]) => pdocRow(as, `qsd_${role.k}_${i}_${key}`, key, need, label, p.spouse.docs[key])).join("")}</div>` : ""}
        </div>`;
      }).join("")}</div>
      ${role.o.add || role.o.neighbor || !list.length ? `<button type="button" class="btn ghost small" data-qadd="${role.k}">+ Thêm ${esc(role.label.toLowerCase())}</button>` : ""}
    </div>`;
  }).join("");
}

/* Bản in cho phiếu Word */
function famSheetHtml(f){
  const ana = famAnalyze(f);
  const c = "border:1px solid #999;padding:6px;vertical-align:top;", h = c + "background:#E1EEE8;font-weight:bold;";
  const rows = f.people.filter(p => relevant(f, p)).map(p => {
    const miss = famDocs(f, p, ana).filter(([k, n]) => n === 1 && !["co", "nop"].includes((p.docs[k] || {}).s)).map(([k, n, l]) => (l || PDOC[k].label) + ((p.docs[k] || {}).r ? " (" + p.docs[k].r + ")" : ""));
    return `<tr><td style="${c}">${esc(pLabel(f, p))}</td><td style="${c}">${esc(p.name || "(chưa ghi tên)")}</td><td style="${c}">${esc(stTxt(p))}${p.abroad ? " · ở nước ngoài" : ""}</td><td style="${c}">${esc(ROLE_TXT[ana.role[p.id]] || "")}</td><td style="${c}color:#B8322A">${esc(miss.join("; ")) || "Đủ"}</td></tr>`;
  }).join("");
  return `<p>Sổ đứng tên: <b>${f.owners === "both" ? "bố và mẹ" : f.owners === "A" ? "bố" : "mẹ"}</b> · Bố mẹ: ${f.married === "yes" ? "là vợ chồng đến khi mất" : "đã ly hôn / không đăng ký kết hôn"}</p>
    <table style="border-collapse:collapse;width:100%"><tr><td style="${h}">Quan hệ</td><td style="${h}">Họ tên</td><td style="${h}">Tình trạng</td><td style="${h}">Vai trò</td><td style="${h}">Giấy tờ còn thiếu</td></tr>${rows}</table>
    ${ana.warn.length ? `<p><b>Cần làm rõ:</b></p><ul>${ana.warn.map(l => `<li>${esc(l)}</li>`).join("")}</ul>` : ""}
    <p style="font-size:10pt;color:#555">Phần trăm từng người: xem báo cáo thừa kế riêng của Vua Mặt Phố.</p>`;
}

/* Chỉ xem (trang quản lý, phiếu xuất) */
function partyViewHtml(r, onlySvc){
  const roles = partyRoles(r.allServices || r.services || []).filter(x => onlySvc ? x.svc === onlySvc : (r.services || []).includes(x.svc)), parties = r.parties || {};
  const rows = roles.flatMap(role => (parties[role.k] || []).map((p, i) => `<tr><td>${esc(role.label)}</td><td>${esc(p.name || "(chưa ghi tên)")}</td><td class="mono">${esc(p.phone || "")}</td>
    <td>${role.o.neighbor ? esc([p.dir && "giáp phía " + p.dir, p.informed].filter(Boolean).join(" · ")) : esc([p.status === "dead" ? "Đã mất" : "Còn sống", p.abroad ? "ở nước ngoài" : "", p.marital, p.spouse && p.spouse.name ? "vợ/chồng: " + p.spouse.name : ""].filter(Boolean).join(" · "))}</td></tr>`));
  return rows.length ? `<table style="border-collapse:collapse;width:100%"><thead><tr><th>Vai trò</th><th>Họ tên</th><th>SĐT</th><th>Thông tin</th></tr></thead><tbody>${rows.join("")}</tbody></table>` : "";
}
