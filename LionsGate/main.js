(function() {
  const eventTime = new Date(window.LIONSGATE_TIME_UTC).getTime();
  const countEl = document.getElementById('count');
  const whisperEl = document.getElementById('whisper');
  const armBtn = document.getElementById('arm');
  const hum = document.getElementById('hum');
  const chime = document.getElementById('chime');

  const whispers = [
    "From the Silence before the Dawn, the Eighth Gate rises.",
    "Those who watch shall be seen.",
    "Those who wait shall be chosen.",
    "The Lion stands at the Threshold."
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
      document.body.classList.add('fade-to-black');
      setTimeout(() => { window.location.href = 'reveal.html'; }, 1500);
      return;
    }
    const h = Math.floor((d % (1000*60*60*24))/(1000*60*60));
    const m = Math.floor((d % (1000*60*60))/(1000*60));
    const s = Math.floor((d % (1000*60))/1000);
    countEl.textContent = `${fmt(h)}:${fmt(m)}:${fmt(s)}`;
    requestAnimationFrame(tick);
  }

  armBtn.addEventListener('click', () => {
    armBtn.textContent = 'ARMED';
    armBtn.disabled = true;
    try {
      hum.play();
      setInterval(() => chime.play().catch(()=>{}), 480000); // every 8 min
    } catch(_) {}
  });

  // Starfield background
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let w, h, stars = [];
  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    stars = Array.from({length: 100}, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.5,
      d: Math.random() * 0.5
    }));
  }
  window.addEventListener('resize', resize);
  resize();
  function drawStars() {
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle = '#fff';
    stars.forEach(s => {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI*2);
      ctx.fill();
      s.y += s.d;
      if (s.y > h) s.y = 0;
    });
    requestAnimationFrame(drawStars);
  }
  drawStars();

  tick();
})();
