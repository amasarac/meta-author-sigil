(function(){
  // === Config
  const eventTime = new Date(window.LIONSGATE_TIME_UTC || "2025-08-08T08:15:00Z").getTime();
  const countEl = document.getElementById('count');
  const whisperEl = document.getElementById('whisper');
  const armBtn = document.getElementById('arm');
  const hum = document.getElementById('hum');
  const chime = document.getElementById('chime');

  // === Prophecy fragments (rotate every 20s)
  const whispers = [
    "...the Eighth Gate...",
    "𓂀 the threshold waits",
    "∴ chosen in the silence",
    "those who watch shall..."
  ];
  let wi = 0;
  function cycleWhisper(){
    if(!whisperEl) return;
    whisperEl.style.opacity = 0;
    setTimeout(()=>{ whisperEl.textContent = whispers[wi]; whisperEl.style.opacity = 1; wi=(wi+1)%whispers.length; }, 800);
  }
  cycleWhisper(); setInterval(cycleWhisper, 20000);

  // === Countdown + glyph flash → reveal.html (if you have it)
  function fmt(n){ return String(n).padStart(2,'0'); }
  function flashGlyphs(){
    const d=document.createElement('div');
    d.className='flash-glyphs';
    d.textContent='⟁ 𓂀 ☌ ∴ ⧖ ⌬';
    document.body.appendChild(d);
    setTimeout(()=>d.remove(),1000);
  }
  function tick(){
    const d = eventTime - Date.now();
    if (d <= 0) {
      flashGlyphs();
      setTimeout(()=>{ window.location.href = 'reveal.html'; }, 1000);
      return;
    }
    const h = Math.floor((d % 86400000) / 3600000);
    const m = Math.floor((d % 3600000) / 60000);
    const s = Math.floor((d % 60000) / 1000);
    if(countEl) countEl.textContent = `${fmt(h)}:${fmt(m)}:${fmt(s)}`;
    requestAnimationFrame(tick);
  }
  tick();

  // === ARM-gated audio
  armBtn?.addEventListener('click', ()=>{
    armBtn.textContent='⟁'; armBtn.disabled = true;
    try{ hum.volume=0.25; hum.loop=true; hum.play(); }catch(_){}
    setInterval(()=>{ try{ chime.currentTime=0; chime.play(); }catch(_){} }, 8*60*1000);
  });

  // === Starfield (subtle parallax drift)
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let w,h,stars=[];
  function resize(){ w=canvas.width=window.innerWidth; h=canvas.height=window.innerHeight; stars = Array.from({length:140},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5+0.5,d:Math.random()*0.4+0.1,drift:(Math.random()-0.5)*0.2})); }
  window.addEventListener('resize', resize); resize();
  function drawStars(){
    ctx.clearRect(0,0,w,h); ctx.fillStyle='#fff';
    stars.forEach(s=>{ ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2); ctx.fill(); s.y+=s.d; s.x+=s.drift; if(s.y>h) s.y=0; if(s.x>w) s.x=0; if(s.x<0) s.x=w; });
    requestAnimationFrame(drawStars);
  }
  drawStars();

  // === Telemetry (non-visual)
  (function(){
    const key='MAS_lg_telemetry';
    function log(evt,extra={}){ try{ const a=JSON.parse(localStorage.getItem(key)||'[]'); a.push(Object.assign({t:new Date().toISOString(),evt},extra)); localStorage.setItem(key,JSON.stringify(a)); }catch(_){}} 
    armBtn?.addEventListener('click',()=>log('arm'));
    const _fg = flashGlyphs; window.flashGlyphs = function(){ log('flash'); return _fg(); };
  })();
})();
