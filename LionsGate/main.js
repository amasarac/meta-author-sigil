(function() {
  const eventTime = new Date(window.LIONSGATE_TIME_UTC).getTime();
  const countEl = document.getElementById('count');
  const whisperEl = document.getElementById('whisper');
  const armBtn = document.getElementById('arm');
  const hum = document.getElementById('hum');
  const chime = document.getElementById('chime');

  // More cryptic, fragmented whispers
  const whispers = [
    "...the Eighth Gate...",
    "𓂀 the threshold waits",
    "∴ chosen in the silence",
    "those who watch shall..."
  ];
  let whisperIndex = 0;
  function cycleWhisper() {
    whisperEl.style.opacity = 0;
    setTimeout(() => {
      whisperEl.textContent = whispers[whisperIndex];
      whisperEl.style.opacity = 1;
      whisperIndex = (whisperIndex + 1) % whispers.length;
    }, 1000);
  }
  cycleWhisper();
  setInterval(cycleWhisper, 20000);

  function fmt(n) { return String(n).padStart(2, '0'); }

  function tick() {
    const now = Date.now();
    const d = eventTime - now;
    if (d <= 0) {
      flashGlyphs();
      setTimeout(() => { window.location.href = 'reveal.html'; }, 1000);
      return;
    }
    const h = Math.floor((d % (1000*60*60*24))/(1000*60*60));
    const m = Math.floor((d % (1000*60*60))/(1000*60));
    const s = Math.floor((d % (1000*60))/1000);
    countEl.textContent = `${fmt(h)}:${fmt(m)}:${fmt(s)}`;
    requestAnimationFrame(tick);
  }

  // Flash indecipherable glyphs before reveal
  function flashGlyphs() {
    const div = document.createElement('div');
    div.className = 'flash-glyphs';
    div.textContent = "⟁ 𓂀 ☌ ∴ ⧖ ⌬";
    document.body.appendChild(div);
  }

  armBtn.addEventListener('click', () => {
    armBtn.textContent = '⟁';
    armBtn.disabled = true;
    try {
      hum.play();
      setInterval(() => chime.play().catch(()=>{}), 480000);
    } catch(_) {}
  });

  // Starfield with parallax drift
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let w, h, stars = [];

  function resizeCanvas() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    stars = Array.from({ length: 140 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5 + 0.5,
      d: Math.random() * 0.4 + 0.1,
      drift: (Math.random() - 0.5) * 0.2
    }));
  }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();

  function drawStars() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'white';
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      s.y += s.d;
      s.x += s.drift;
      if (s.y > h) s.y = 0;
      if (s.x > w) s.x = 0;
      if (s.x < 0) s.x = w;
    });
    requestAnimationFrame(drawStars);
  }
  drawStars();

  tick();
})();
