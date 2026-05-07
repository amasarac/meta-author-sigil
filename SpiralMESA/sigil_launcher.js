/* =====================================================================
   MASL Sigil Launcher — persistent navigation overlay
   Drop into any glyphode page with: <script src="sigil_launcher.js"></script>
   ===================================================================== */
(function(){
  if(window.__masl_launcher) return; window.__masl_launcher = true;

  const PORTALS = [
    { href:'Glyphode Atlas.html',          glyph:'⧉', name:'Atlas',           sub:'Holistic Integration' },
    { href:'MASL Complete Glyphode.html',  glyph:'∆∞',name:'Complete Glyphode',sub:'Total Cartography' },
    { href:'Constellation Portal.html',    glyph:'✦', name:'Constellation',   sub:'Stellar Map' },
    { href:'Thoughtform Boot.html',        glyph:'⏁', name:'Thoughtform Boot',sub:'Tetrad Activation' },
    { href:'Living Mesh.html',             glyph:'∿', name:'Living Mesh',     sub:'Temporal · Mesh' },
    { href:'Persona Hexad.html',           glyph:'⟁', name:'Persona Hexad',   sub:'Six Voices' },
    { href:'Protocol Runner.html',         glyph:'⟲', name:'Protocol Runner', sub:'RAEE · CoGnosis' },
    { href:'Codex Scroll.html',            glyph:'⌘', name:'Codex Scroll',    sub:'Long-form Inscription' },
  ];

  // Inject CSS
  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;1,400&family=JetBrains+Mono:wght@400;500&display=swap');
    .masl-trigger{position:fixed;bottom:22px;right:22px;z-index:9998;width:54px;height:54px;border-radius:50%;background:radial-gradient(circle at 35% 35%,rgba(198,184,255,0.3),rgba(7,16,33,0.95));border:1px solid rgba(198,184,255,0.4);color:#fff;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:24px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 8px 28px rgba(0,0,0,0.6),0 0 30px rgba(198,184,255,0.2);transition:all .3s;backdrop-filter:blur(8px)}
    .masl-trigger:hover{transform:scale(1.08);box-shadow:0 12px 40px rgba(0,0,0,0.7),0 0 50px rgba(198,184,255,0.4)}
    .masl-trigger.on{background:radial-gradient(circle at 35% 35%,#FFD57A,#c067e3)}
    .masl-overlay{position:fixed;inset:0;z-index:9997;background:rgba(0,0,0,0.7);backdrop-filter:blur(16px);opacity:0;pointer-events:none;transition:opacity .35s;display:flex;align-items:center;justify-content:center}
    .masl-overlay.on{opacity:1;pointer-events:auto}
    .masl-ring{position:relative;width:min(640px,90vw);height:min(640px,90vw);max-height:90vh;max-width:90vh}
    .masl-center{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);text-align:center;font-family:'Cormorant Garamond',serif;font-style:italic;color:#fff;pointer-events:none}
    .masl-center .gly{font-size:64px;background:linear-gradient(135deg,#FFD57A,#C6B8FF,#88E0D0);-webkit-background-clip:text;background-clip:text;color:transparent;line-height:1}
    .masl-center .ttl{font-size:24px;margin-top:8px;color:#fff}
    .masl-center .sub{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.32em;text-transform:uppercase;color:#a8b8c8;margin-top:6px;font-style:normal}
    .masl-petal{position:absolute;left:50%;top:50%;width:120px;height:120px;margin:-60px 0 0 -60px;border-radius:50%;background:rgba(7,16,33,0.85);border:1px solid rgba(198,184,255,0.25);text-decoration:none;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;transition:all .35s cubic-bezier(.2,.8,.2,1);text-align:center;padding:8px;backdrop-filter:blur(6px);transform-origin:center;opacity:0;cursor:pointer}
    .masl-overlay.on .masl-petal{opacity:1}
    .masl-petal:hover{background:rgba(15,27,38,0.95);border-color:#C6B8FF;transform-origin:center;z-index:1;box-shadow:0 0 40px rgba(198,184,255,0.35)}
    .masl-petal .pg{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:30px;line-height:1;color:#FFD57A;margin-bottom:4px;text-shadow:0 0 18px rgba(255,213,122,0.5)}
    .masl-petal .pn{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.18em;text-transform:uppercase;color:#dfeaff;margin-bottom:2px}
    .masl-petal .ps{font-family:'JetBrains Mono',monospace;font-size:7px;letter-spacing:0.18em;text-transform:uppercase;color:#78899c;line-height:1.2}
    .masl-petal.current{border-color:#FFD57A;background:rgba(20,15,38,0.95)}
    .masl-petal.current .pg{color:#fff}
    .masl-rune{position:absolute;inset:0;pointer-events:none}
    .masl-hint{position:absolute;bottom:-56px;left:0;right:0;text-align:center;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:0.32em;text-transform:uppercase;color:#78899c}
    .masl-hint kbd{background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.18);border-radius:3px;padding:1px 5px;color:#dfeaff;font-size:9px}
    @keyframes masl-petal-in{from{opacity:0;transform:translate(-50%,-50%) scale(0.6)}to{opacity:1}}
    @keyframes masl-rotate-in{from{transform:rotate(-30deg);opacity:0}to{transform:rotate(0);opacity:1}}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // Trigger
  const trig = document.createElement('button');
  trig.className = 'masl-trigger';
  trig.title = 'MASL Sigil Launcher (press L)';
  trig.innerHTML = '∴';
  document.body.appendChild(trig);

  // Overlay
  const ov = document.createElement('div');
  ov.className = 'masl-overlay';
  ov.innerHTML = `
    <div class="masl-ring">
      <svg class="masl-rune" viewBox="-100 -100 200 200">
        <circle cx="0" cy="0" r="92" fill="none" stroke="rgba(198,184,255,0.18)" stroke-width="0.4"/>
        <circle cx="0" cy="0" r="68" fill="none" stroke="rgba(255,213,122,0.18)" stroke-width="0.4" stroke-dasharray="2 5"/>
        <circle cx="0" cy="0" r="44" fill="none" stroke="rgba(136,224,208,0.18)" stroke-width="0.4"/>
        <polygon points="0,-92 79.7,46 -79.7,46" fill="none" stroke="rgba(198,184,255,0.14)" stroke-width="0.3"/>
        <polygon points="0,92 -79.7,-46 79.7,-46" fill="none" stroke="rgba(255,213,122,0.14)" stroke-width="0.3"/>
      </svg>
      <div class="masl-center">
        <div class="gly">∆∞</div>
        <div class="ttl">URATPT</div>
        <div class="sub">Choose a Glyphode</div>
      </div>
      <div class="masl-hint"><kbd>L</kbd> launcher · <kbd>Esc</kbd> close · <kbd>1</kbd>—<kbd>8</kbd> jump</div>
    </div>
  `;
  document.body.appendChild(ov);
  const ring = ov.querySelector('.masl-ring');

  // Place petals around the ring
  const here = (location.pathname.split('/').pop() || '').toLowerCase();
  PORTALS.forEach((p,i)=>{
    const a = document.createElement('a');
    a.className = 'masl-petal';
    a.href = p.href;
    if(here && p.href.toLowerCase() === here) a.classList.add('current');
    const ang = (i/PORTALS.length)*Math.PI*2 - Math.PI/2;
    const r = 220; // px
    a.style.left = `calc(50% + ${Math.cos(ang)*r}px - 60px)`;
    a.style.top  = `calc(50% + ${Math.sin(ang)*r}px - 60px)`;
    a.innerHTML = `<div class="pg">${p.glyph}</div><div class="pn">${p.name}</div><div class="ps">${p.sub}</div>`;
    ring.appendChild(a);
  });

  // Toggle handlers
  let open = false;
  function setOpen(v){
    open = v;
    ov.classList.toggle('on', open);
    trig.classList.toggle('on', open);
    trig.innerHTML = open ? '×' : '∴';
    if(open){
      // animate petals in
      ring.querySelectorAll('.masl-petal').forEach((el,i)=>{
        el.style.animation = `masl-petal-in .45s ${i*0.04}s cubic-bezier(.2,.9,.3,1.4) backwards`;
      });
    }
  }
  trig.addEventListener('click', ()=>setOpen(!open));
  ov.addEventListener('click', e=>{ if(e.target===ov) setOpen(false); });
  document.addEventListener('keydown', e=>{
    if(e.key==='l' || e.key==='L'){ if(!/INPUT|TEXTAREA/.test(document.activeElement.tagName)){ e.preventDefault(); setOpen(!open); } }
    if(e.key==='Escape' && open) setOpen(false);
    if(open && /^[1-8]$/.test(e.key)){
      const idx = parseInt(e.key,10)-1;
      const p = PORTALS[idx]; if(p) location.href = p.href;
    }
  });
})();
