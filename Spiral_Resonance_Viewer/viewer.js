
// Spiral Resonance Viewer — timeline + 3D/4D + SVG export + glyph overlays + tooltips + click highlight

const canvas = document.getElementById("view");
const ctx = canvas.getContext("2d");
const frameSlider = document.getElementById("frameSlider");
const playBtn = document.getElementById("playBtn");
const speedSel = document.getElementById("speed");
const mode4d = document.getElementById("mode4d");
const frameNum = document.getElementById("frameNum");
const frameMax = document.getElementById("frameMax");
const hud = document.getElementById("hud");
const legend = document.getElementById("legend");
const tooltip = document.getElementById("tooltip");
let lastScreenPath = []; // screen-space polyline for current segment
// --- Hover and link state
/* HOVER & LINK STATE */
// lastScreenPath already defined earlier; reuse existing array
let linkScreenSegs = [];            // [{ax,ay,bx,by,aId,bId,semantics,type}]
let hoverLinkIndex = -1;            // index into linkScreenSegs
let pinned = false;
const minimap = document.getElementById('minimap');
const mmCtx = minimap ? minimap.getContext('2d') : null;

// Geometry helpers
function dist2(x1,y1,x2,y2){const dx=x2-x1,dy=y2-y1;return dx*dx+dy*dy}
function distToSeg2(px,py,ax,ay,bx,by){
  const l2 = dist2(ax,ay,bx,by); if(l2===0) return dist2(px,py,ax,ay);
  let t=((px-ax)*(bx-ax)+(py-ay)*(by-ay))/l2; t=Math.max(0,Math.min(1,t));
  const cx=ax+t*(bx-ax), cy=ay+t*(by-ay); return dist2(px,py,cx,cy);
}

// localStorage persistence for glyphPosCache
function saveGlyphCache(){
  const obj={}; glyphPosCache.forEach((v,k)=>{obj[k]=v});
  try{ localStorage.setItem('glyphPosCache', JSON.stringify(obj)); }catch(e){}
}
function restoreGlyphCache(){
  try{
    const raw=localStorage.getItem('glyphPosCache');
    if(!raw) return; const obj=JSON.parse(raw);
    Object.keys(obj).forEach(k=>glyphPosCache.set(parseInt(k,10), obj[k]));
  }catch(e){}
}


// morph data is embedded inline to avoid CORS
const morphData = JSON.parse(document.getElementById("morph-data").textContent);

// external overlays
let mapping = [];            // list of {glyph_id, glyph, semantic_core, phase, ...}
let entanglement = [];       // list of {glyph_id, entangled_with: [ids], ...}
let mappingByGlyph = new Map();
let mappingById = new Map();
let entanglementById = new Map();

async function loadOverlayData(){
  const [mapRes, entRes] = await Promise.all([
    fetch("mapping.json").then(r=>r.ok?r.json():[]),
    fetch("entanglement.json").then(r=>r.ok?r.json():[])
  ]);
  mapping = mapRes || [];
  entanglement = entRes || [];
  mappingByGlyph.clear(); mappingById.clear(); entanglementById.clear();
  for (const m of mapping){
    mappingByGlyph.set(m.glyph, m);
    mappingById.set(m.glyph_id, m);
  }
  for (const e of entanglement){
    entanglementById.set(e.glyph_id, e);
  }
}

let DPR = window.devicePixelRatio || 1;
function fit(){
  const cssW = Math.max(1, Math.floor(window.innerWidth));
  const cssH = Math.max(1, Math.floor(window.innerHeight));
  canvas.style.width = cssW + "px";
  canvas.style.height = cssH + "px";
  DPR = window.devicePixelRatio || 1;
  const pxW = Math.max(1, Math.floor(cssW * DPR));
  const pxH = Math.max(1, Math.floor(cssH * DPR));
  if (canvas.width !== pxW || canvas.height !== pxH){
    canvas.width = pxW; canvas.height = pxH;
  }
  ctx.setTransform(DPR,0,0,DPR,0,0);
  ctx.imageSmoothingEnabled = false;
}
new ResizeObserver(fit).observe(document.body);
fit();

// Flatten frames across all segments
const frames = []; // [{seg, step}]
morphData.forEach((seg, si) => {
  for (let i = 0; i < seg.path.length; i++) {
    frames.push({ seg: si, step: i });
  }
});
frameSlider.max = Math.max(0, frames.length - 1);
frameMax.textContent = frames.length - 1;

let playing = false;
let frame = 0;
let rafId = 0;

function hsl(h,s,l){ return `hsl(${h}deg, ${s}%, ${l}%)`; }
function lerp(a,b,t){ return a+(b-a)*t; }

// 3D -> 2D projection; optional 4D lift uses normalized step as w
function project(pt, w) {
  const [x,y,z] = pt;
  if (mode4d.checked) {
    const ww = (w==null?0:w);
    const k = 220 / (ww + 2.2); // mild perspective in "w"
    return [ x*k, -y*k ];
  } else {
    const k = 22;
    return [ x*k, -y*k ];
  }
}

function layoutForSegment(seg) {
  const P = seg.path;
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for (let i=0;i<P.length;i++) {
    const p = project(P[i], i/(P.length-1));
    minX = Math.min(minX, p[0]); maxX = Math.max(maxX, p[0]);
    minY = Math.min(minY, p[1]); maxY = Math.max(maxY, p[1]);
  }
  const W = canvas.clientWidth, H = canvas.clientHeight, pad = 60;
  const sx = (W - pad*2)/(maxX-minX || 1), sy = (H - pad*2)/(maxY-minY || 1);
  const s = Math.min(sx, sy);
  const cx = (minX+maxX)/2, cy=(minY+maxY)/2;
  const ox = W/2 - cx*s, oy = H/2 - cy*s;
  return {s, ox, oy};
}

function drawSegmentPath(seg, ox, oy, s, screenPtsOut) {
  const P = seg.path;
  ctx.lineWidth = 4;
  for (let i=0;i<P.length-1;i++) {
    const t = i/(P.length-1);
    ctx.strokeStyle = hsl(260 - 220*t, 85, 58);
    const a = project(P[i], t), b = project(P[i+1], (i+1)/(P.length-1));
    const ax = ox + a[0]*s, ay = oy + a[1]*s;
    const bx = ox + b[0]*s, by = oy + b[1]*s;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();
    if (screenPtsOut) {
      if (i===0) screenPtsOut.push([ax,ay]);
      screenPtsOut.push([bx,by]);
    }
  }
}

function drawGlyphLabel(glyphChar, meta, x, y){
  // glyph char
  ctx.save();
  if (useShadows){ ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 3; }
  ctx.shadowColor = "rgba(0,0,0,0.75)";
  ctx.shadowBlur = 6;
  ctx.font = "32px serif";
  ctx.fillStyle = "#fff";
  ctx.fillText(glyphChar, x, y);
  ctx.restore();

  // mnemo
  ctx.font = "14px sans-serif";
  ctx.fillStyle = "#7AE9C4";
  const mnemo = meta?.semantic_core ? `(${meta.semantic_core})` : "";
  ctx.fillText(mnemo, x + 20, y + 2);

  // phase
  ctx.fillStyle = "#CDB4FF";
  const phaseText = meta?.phase || "";
  ctx.fillText(phaseText, x + 20, y + 16);
}

function drawEntanglementSpokes(centerX, centerY, count=0, radius=18){
  if (!count) return;
  ctx.save();
  if (useShadows){ ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 3; }
  ctx.strokeStyle = "rgba(255,0,200,0.6)";
  ctx.lineWidth = 1;
  for (let i=0;i<count;i++){
    const a = (i/count) * Math.PI * 2;
    const x2 = centerX + Math.cos(a)*radius;
    const y2 = centerY + Math.sin(a)*radius;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
  ctx.restore();
}

// for hit-testing of hover/click


function drawGrid(){
  const W = canvas.clientWidth, H = canvas.clientHeight;
  ctx.save();
  if (useShadows){ ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 3; } ctx.strokeStyle='rgba(255,255,255,0.06)'; ctx.lineWidth=1;
  const step=80; for(let x=0;x<=W;x+=step){ ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,H); ctx.stroke(); }
  for(let y=0;y<=H;y+=step){ ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(W,y); ctx.stroke(); }
  // center crosshair
  ctx.strokeStyle='rgba(255,255,255,0.12)';
  ctx.beginPath(); ctx.moveTo(W/2,0); ctx.lineTo(W/2,H); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();
  ctx.restore();
}

function draw() {
  const W = canvas.clientWidth, H = canvas.clientHeight;
  ctx.clearRect(0,0,W,H);
  if (showGrid) drawGrid();
  if (showGrid) drawGrid();
  const info = frames[frame];
  const seg = morphData[info.seg];
  const P = seg.path;
  const {s, ox, oy} = layoutForSegment(seg);

  lastScreenPath = [];
  drawSegmentPath(seg, ox, oy, s, lastScreenPath);

  // marker
  const step = info.step;
  const pm = project(P[step], step/(P.length-1));
  const mx = ox + pm[0]*s, my = oy + pm[1]*s;
  ctx.fillStyle = "#7AE9C4";
  ctx.beginPath();
  ctx.arc(mx, my, 6*(window.devicePixelRatio||1), 0, Math.PI*2);
  ctx.fill();

  // FROM / TO glyph overlays at endpoints
  const pStart = project(P[0], 0);
  const pEnd   = project(P[P.length-1], 1);
  const sx = ox + pStart[0]*s, sy = oy + pStart[1]*s;
  const ex = ox + pEnd[0]*s,   ey = oy + pEnd[1]*s;

  const metaFrom = mappingByGlyph.get(seg.from);
  const metaTo   = mappingByGlyph.get(seg.to);
  drawGlyphLabel(seg.from, metaFrom, sx + 8, sy - 8);
  drawGlyphLabel(seg.to,   metaTo,   ex + 8, ey - 8);

  // Entanglement spokes at endpoints (count only; positions unknown)
  const spokesFrom = metaFrom && entanglementById.get(metaFrom.glyph_id)?.entangled_with?.length || 0;
  const spokesTo   = metaTo   && entanglementById.get(metaTo.glyph_id)?.entangled_with?.length   || 0;
  drawEntanglementSpokes(sx, sy, spokesFrom);
  drawEntanglementSpokes(ex, ey, spokesTo);

  // HUD & legend
  frameNum.textContent = frame;
  hud.innerHTML = `
    <div><span class="t">segment</span> <b>${seg.from}</b> → <b>${seg.to}</b></div>
    <div><span class="t">mnemonics</span> ${seg.mnemonic_from} → ${seg.mnemonic_to}</div>
    <div><span class="t">step</span> ${step} / ${P.length-1} | <span class="t">4D</span> ${mode4d.checked?'ON':'OFF'}</div>
  `;
  legend.innerHTML = "";
  [{title:"FROM", g:seg.from, m:seg.mnemonic_from},{title:"TO", g:seg.to, m:seg.mnemonic_to}].forEach(it=>{
    const div = document.createElement('div');
    div.className = 'item';
    div.textContent = `${it.title}: ${it.g} — ${it.m}`;
    div.style.cursor = "pointer";
    div.onclick = () => jumpToNextSegmentWithGlyph(it.g);
    legend.appendChild(div);
  });
  drawMinimap();
}

function jumpToNextSegmentWithGlyph(glyphChar){
  const curInfo = frames[frame];
  for (let i = curInfo.seg + 1; i < morphData.length; i++){
    const s = morphData[i];
    if (s.from === glyphChar || s.to === glyphChar){
      // jump to first frame of that segment
      const baseIndex = frames.findIndex(f => f.seg === i && f.step === 0);
      if (baseIndex >= 0){
        frame = baseIndex;
        frameSlider.value = frame;
        draw();
        return;
      }
    }
  }
}

document.getElementById("exportSvgBtn").addEventListener("click", () => {
  const info = frames[frame];
  const seg = morphData[info.seg];
  const {s, ox, oy} = layoutForSegment(seg);
  // build d
  const P = seg.path;
  let d = "";
  for (let i=0;i<P.length;i++) {
    const p = project(P[i], i/(P.length-1));
    const x = (ox + p[0]*s).toFixed(2);
    const y = (oy + p[1]*s).toFixed(2);
    d += (i===0?`M ${x} ${y}`:` L ${x} ${y}`);
  }
  const tpl = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
  <path d="${d}" fill="none" stroke="#7AE9C4" stroke-width="2"/>
  <text x="24" y="36" font-family="system-ui,Segoe UI" font-size="16" fill="#eaeaea">${seg.from} → ${seg.to}</text>
  <text x="24" y="60" font-family="system-ui,Segoe UI" font-size="12" fill="#8aa0b6">${seg.mnemonic_from} → ${seg.mnemonic_to}</text>
</svg>`;
  const blob = new Blob([tpl], {type:"image/svg+xml"});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `segment_${String(info.seg).padStart(3,'0')}.svg`;
  a.click();
  setTimeout(()=>URL.revokeObjectURL(a.href), 1000);
});

// hover tooltip over nearest path point
canvas.addEventListener("mousemove", (ev) => {
  const rect = canvas.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;
  const idx = nearestPointIndex(x, y, 10);
  if (idx >= 0) {
    const info = frames[frame];
    const seg = morphData[info.seg];
    tooltip.style.display = "block";
    tooltip.style.left = (ev.clientX + 12) + "px";
    tooltip.style.top = (ev.clientY + 12) + "px";
    tooltip.innerHTML = `<div><b>${seg.from}</b> → <b>${seg.to}</b></div>
      <div>step ${idx}/${lastScreenPath.length-1}</div>
      <div style="color:#8aa0b6">${seg.mnemonic_from} → ${seg.mnemonic_to}</div>`;
  } else {
    tooltip.style.display = "none";
  }
});

// click pins/unpins highlight (simple state toggle for now)
canvas.addEventListener("click", () => {
  pinned = !pinned;
});

function nearestPointIndex(x, y, maxDist=12){
  let best = -1, bestD = maxDist*maxDist;
  for (let i=0;i<lastScreenPath.length;i++){
    const dx = x - lastScreenPath[i][0];
    const dy = y - lastScreenPath[i][1];
    const d2 = dx*dx + dy*dy;
    if (d2 < bestD){ bestD = d2; best = i; }
  }
  return best;
}

function playTick() {
  const mult = parseInt(speedSel.value,10) || 1;
  for (let k=0;k<mult;k++) frame = (frame + 1) % frames.length;
  frameSlider.value = frame;
  draw();
  rafId = requestAnimationFrame(playTick);
}

frameSlider.addEventListener("input", e => { frame = parseInt(e.target.value)||0; draw(); });
speedSel.addEventListener("change", () => { if (!playing) draw(); });
mode4d.addEventListener("change", () => draw());
playBtn.addEventListener("click", () => {
  playing = !playing;
  playBtn.textContent = playing ? "⏸" : "▶";
  if (playing) rafId = requestAnimationFrame(playTick); else cancelAnimationFrame(rafId);
});

// init
loadOverlayData().then(() => { draw(); playBtn.click(); });

// === Entanglement link support ===
/* ENTANGLEMENT LINK CACHE */
const glyphPosCache = new Map(); // glyph_id -> {x,y,seenAtSeg}
function updateGlyphPosCache(glyphMeta, x, y, segIndex){
  if (!glyphMeta || glyphMeta.glyph_id === undefined) return;
  glyphPosCache.set(glyphMeta.glyph_id, {x, y, seenAtSeg: segIndex});
}

function drawEntanglementLinks(){
  ctx.save();
  if (useShadows){ ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 3; }
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(0, 255, 255, 0.25)";
  entanglement.forEach(e => {
    const a = glyphPosCache.get(e.glyph_id);
    if (!a) return;
    (e.entangled_with || []).forEach(tid => {
      const b = glyphPosCache.get(tid);
      if (!b) return;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });
  });
  ctx.restore();
}

/* LINK HOVER HANDLER */
canvas.addEventListener("mousemove", (ev) => {
  const rect = canvas.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;
  // prefer link hover first
  let best = -1, bestD = 14*14;
  for (let i=0;i<linkScreenSegs.length;i++){
    const L = linkScreenSegs[i];
    const d2 = distToSeg2(x,y,L.ax,L.ay,L.bx,L.by);
    if (d2 < bestD){ bestD = d2; best = i; }
  }
  hoverLinkIndex = best;
  if (hoverLinkIndex >= 0){
    const L = linkScreenSegs[hoverLinkIndex];
    tooltip.style.display = "block";
    tooltip.style.left = (ev.clientX + 12) + "px";
    tooltip.style.top = (ev.clientY + 12) + "px";
    const aMeta = mappingById.get(L.aId);
    const bMeta = mappingById.get(L.bId);
    tooltip.innerHTML = `<div style="margin-bottom:4px"><b>${aMeta?.glyph||L.aId}</b> ⇄ <b>${bMeta?.glyph||L.bId}</b></div>
      <div style="color:#8aa0b6">${(L.semantics||[]).join(', ')}</div>
      <div style="color:#9fb4cc">${L.type||''}</div>`;
    draw(); // redraw to show highlight
    return;
  }
  // fall back to path-point hover
  const idx = nearestPointIndex(x, y, 10);
  if (idx >= 0) {
    const info = frames[frame];
    const seg = morphData[info.seg];
    tooltip.style.display = "block";
    tooltip.style.left = (ev.clientX + 12) + "px";
    tooltip.style.top = (ev.clientY + 12) + "px";
    tooltip.innerHTML = `<div><b>${seg.from}</b> → <b>${seg.to}</b></div>
      <div>step ${idx}/${lastScreenPath.length-1}</div>
      <div style="color:#8aa0b6">${seg.mnemonic_from} → ${seg.mnemonic_to}</div>`;
  } else {
    tooltip.style.display = "none";
    if (hoverLinkIndex !== -1){ hoverLinkIndex = -1; draw(); }
  }
});

function drawMinimap(){
  if (!mmCtx || !minimap) return;
  const mmDPR = window.devicePixelRatio || 1;
  const cssW = minimap.clientWidth || minimap.width;
  const cssH = minimap.clientHeight || minimap.height;
  if (minimap.width !== Math.floor(cssW*mmDPR)) {
    minimap.width = Math.floor(cssW*mmDPR);
    minimap.height = Math.floor(cssH*mmDPR);
    mmCtx.setTransform(mmDPR,0,0,mmDPR,0,0);
    mmCtx.imageSmoothingEnabled = false;
  }
  if (!mmCtx || !minimap) return;
  const dpr = window.devicePixelRatio||1;
  minimap.width = minimap.clientWidth * dpr;
  minimap.height = minimap.clientHeight * dpr;
  mmCtx.setTransform(dpr,0,0,dpr,0,0);
  if (!mmCtx || !minimap) return;
  const W = minimap.width, H = minimap.height;
  mmCtx.clearRect(0,0,W,H);
  // bounds
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  glyphPosCache.forEach(v => {
    minX = Math.min(minX, v.x); maxX = Math.max(maxX, v.x);
    minY = Math.min(minY, v.y); maxY = Math.max(maxY, v.y);
  });
  if (minX===Infinity){ // nothing cached yet
    mmCtx.fillStyle = "rgba(255,255,255,.25)";
    mmCtx.fillText("minimap: play to seed", 10, 20);
    return;
  }
  const pad = 10;
  const sx = (W - pad*2)/Math.max(1, (maxX-minX));
  const sy = (H - pad*2)/Math.max(1, (maxY-minY));
  const s = Math.min(sx, sy);
  const ox = pad - minX*s, oy = pad - minY*s;

  // links
  mmCtx.strokeStyle = "rgba(0,255,255,.35)"; mmCtx.lineWidth = 1;
  entanglement.forEach(e => {
    const a = glyphPosCache.get(e.glyph_id);
    if (!a) return;
    (e.entangled_with||[]).forEach(tid=>{
      const b = glyphPosCache.get(tid); if (!b) return;
      mmCtx.beginPath();
      mmCtx.moveTo(ox + a.x*s, oy + a.y*s);
      mmCtx.lineTo(ox + b.x*s, oy + b.y*s);
      mmCtx.stroke();
    });
  });
  // nodes
  mmCtx.fillStyle = "#7AE9C4";
  glyphPosCache.forEach(v => {
    mmCtx.beginPath();
    mmCtx.arc(ox + v.x*s, oy + v.y*s, 2, 0, Math.PI*2);
    mmCtx.fill();
  });
}
