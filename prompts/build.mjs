// สร้างหน้าคลังพรอมต์ (HTML สำหรับ artifact) และไฟล์ Markdown จาก oracle-prompts.json
import { readFileSync, writeFileSync } from "node:fs";
const dir = new URL(".", import.meta.url).pathname;
const d = JSON.parse(readFileSync(dir + "oracle-prompts.json", "utf8"));
const out = process.argv[2] || dir + "oracle-prompts.html";

const md = [`# พรอมต์ภาพไพ่ออราเคิลเทพฮินดู (44 ใบ)`, ``, `**สไตล์ร่วม:** ${d.style}`, ``, `**Negative:** ${d.negative}`, ``,
  ...d.cards.map(([th, subj], i) => `## ${String(i + 1).padStart(2, "0")} ${th}\n\n${subj}, ${d.style}`)].join("\n");
writeFileSync(dir + "oracle-image-prompts.md", md + "\n");

const html = `<title>Deity Card Prompts</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Chonburi&family=IBM+Plex+Sans+Thai:wght@400;600&family=IBM+Plex+Mono:wght@400&display=swap">
<style>
/* Layout: one column workbench — tool picker and shared style on top, then one copyable prompt block per card. Single dark look matching the oracle app. */
:root { --bg:#1f0d14; --panel:#2c121c; --edge:#4a1d2c; --ink:#f3e6d2; --muted:#c4a7a9; --gold:#e6a93a; --ok:#9fcf9a;
  --display:"Chonburi","IBM Plex Sans Thai",serif; --body:"IBM Plex Sans Thai",system-ui,sans-serif; --mono:"IBM Plex Mono",ui-monospace,monospace; color-scheme:dark; }
* { box-sizing:border-box; }
body { background:var(--bg); color:var(--ink); font-family:var(--body); font-size:15px; line-height:1.6; margin:0;
  padding-left:max(16px,env(safe-area-inset-left,0px)); padding-right:max(16px,env(safe-area-inset-right,0px)); padding-block:20px 48px; }
.wrap { max-width:760px; margin:0 auto; display:grid; gap:18px; }
h1 { font-family:var(--display); font-weight:400; color:var(--gold); font-size:1.6rem; margin:0; text-wrap:balance; }
p { margin:0; } .muted { color:var(--muted); font-size:.88rem; }
.seg { display:flex; flex-wrap:wrap; gap:8px; }
.seg button { font:inherit; font-size:.88rem; color:var(--ink); background:transparent; border:1px solid var(--edge); border-radius:999px; padding:6px 14px; cursor:pointer; }
.seg button[aria-pressed="true"] { background:rgba(230,169,58,.2); border-color:var(--gold); color:var(--gold); }
button:focus-visible { outline:2px solid var(--gold); outline-offset:2px; }
.box { background:var(--panel); border:1px solid var(--edge); border-radius:12px; padding:12px 14px; display:grid; gap:8px; min-width:0; }
.box h2 { font-size:.95rem; margin:0; color:var(--gold); }
pre { font-family:var(--mono); font-size:.78rem; white-space:pre-wrap; word-break:break-word; margin:0; color:var(--ink); }
.row { display:flex; gap:10px; align-items:baseline; justify-content:space-between; flex-wrap:wrap; }
.no { font-variant-numeric:tabular-nums; color:var(--muted); font-size:.8rem; }
.copy { font:inherit; font-size:.82rem; font-weight:600; border-radius:8px; padding:5px 12px; cursor:pointer; border:1px solid var(--gold); background:transparent; color:var(--gold); }
.copy.done { border-color:var(--ok); color:var(--ok); }
ol.tips { margin:0; padding-left:1.2em; display:grid; gap:4px; font-size:.88rem; }
</style>
<div class="wrap">
  <header style="display:grid;gap:4px">
    <h1>พรอมต์ภาพไพ่ออราเคิลเทพฮินดู</h1>
    <p class="muted">44 ใบ เรียงตามเลขในแอป · ใช้สไตล์เดียวกันทุกใบเพื่อให้สำรับกลมกลืน · เลือกเครื่องมือแล้วกดคัดลอกทีละใบ</p>
  </header>
  <div class="seg" role="group" aria-label="เครื่องมือสร้างภาพ" id="tool">
    <button type="button" data-t="chat" aria-pressed="true">ChatGPT / Gemini</button>
    <button type="button" data-t="mj">Midjourney</button>
    <button type="button" data-t="sd">Stable Diffusion / Leonardo</button>
  </div>
  <div class="box"><h2>วิธีใช้ให้สำรับออกมาเหมือนกันทั้งชุด</h2><ol class="tips" id="tips"></ol></div>
  <div class="box" id="negBox"><div class="row"><h2>Negative prompt (ช่องแยก)</h2><button type="button" class="copy" data-neg>คัดลอก</button></div><pre id="neg"></pre></div>
  <div id="list" style="display:grid;gap:12px"></div>
</div>
<script>
(() => {
  const D = ${JSON.stringify(d)};
  const TIPS = {
    chat: ["วางพรอมต์ทีละใบ ถ้าภาพแรกใช้ได้ ให้พิมพ์ต่อในแชตเดิมว่า 'ใช้สไตล์เดียวกับภาพก่อนหน้า' เพื่อให้ทั้งชุดเข้ากัน", "ขอขนาดแนวตั้ง 2:3 (เช่น 1024×1536)", "ถ้าระบบปฏิเสธ ให้ลดรายละเอียดที่ดูรุนแรง เช่น อาวุธหรือเปลวไฟ"],
    mj: ["สร้างใบแรกที่ชอบก่อน แล้วใช้ URL ภาพนั้นเป็น --sref กับทุกใบที่เหลือ", "พรอมต์ใส่ --ar 2:3 --style raw ให้แล้ว", "เทพหลายกรมักได้จำนวนมือผิด ให้ใช้ Vary (Region) แก้เฉพาะจุด"],
    sd: ["ใส่ negative prompt ในช่องแยก", "ขนาด 832×1248 หรืออัตราส่วน 2:3", "ล็อก seed และใช้ style reference / LoRA เดียวกันทุกใบ"]
  };
  let tool = "chat";
  const build = (subj) => {
    const core = subj + ", " + D.style;
    if (tool === "mj") return core + " --ar 2:3 --style raw --no text, letters, watermark";
    if (tool === "sd") return core;
    return "Create a vertical 2:3 illustration for an oracle card. " + core + ". Avoid: " + D.negative + ".";
  };
  function render() {
    document.querySelectorAll("#tool button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.t === tool)));
    document.getElementById("tips").innerHTML = TIPS[tool].map((t) => "<li>" + t + "</li>").join("");
    document.getElementById("negBox").hidden = tool !== "sd";
    document.getElementById("neg").textContent = D.negative;
    document.getElementById("list").innerHTML = D.cards.map(([th, subj], i) =>
      '<div class="box"><div class="row"><span><span class="no">' + String(i + 1).padStart(2, "0") + '</span> <b>' + th + '</b></span>' +
      '<button type="button" class="copy" data-i="' + i + '">คัดลอก</button></div><pre></pre></div>').join("");
    document.querySelectorAll("#list pre").forEach((p, i) => { p.textContent = build(D.cards[i][1]); });
  }
  function copy(btn, text) {
    const ok = () => { btn.textContent = "คัดลอกแล้ว"; btn.classList.add("done"); setTimeout(() => { btn.textContent = "คัดลอก"; btn.classList.remove("done"); }, 1500); };
    const fallback = () => { const pre = btn.closest(".box").querySelector("pre"); const r = document.createRange(); r.selectNodeContents(pre); const s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "เลือกข้อความแล้ว กดคัดลอกเอง"; };
    try { navigator.clipboard.writeText(text).then(ok, fallback); } catch { fallback(); }
  }
  document.getElementById("tool").addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) { tool = b.dataset.t; render(); } });
  document.addEventListener("click", (e) => {
    const b = e.target.closest(".copy"); if (!b) return;
    copy(b, b.hasAttribute("data-neg") ? D.negative : build(D.cards[+b.dataset.i][1]));
  });
  render();
})();
</script>
`;
writeFileSync(out, html);
console.log("wrote", out);
