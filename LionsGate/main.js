// LionsGate main.js — safe, final
(function () {
  // -----------------------------
  // Config & DOM
  // -----------------------------
  const TARGET = new Date(window.LIONSGATE_TIME_UTC || "2025-08-08T08:15:00Z").getTime();
  const countEl   = document.getElementById("count");
  const whisperEl = document.getElementById("whisper");
  const armBtn    = document.getElementById("arm");
  const hum       = document.getElementById("hum");
  const chime     = document.getElementById("chime");

  // -----------------------------
  // Prophecy whispers
  // -----------------------------
  const whispers = [
    "...the Eighth Gate...",
    "𓂀 the threshold waits",
    "∴ chosen in the silence",
    "those who watch shall..."
  ];
  let wIndex = 0;
  function cycleWhisper() {
    if (!whisperEl) return;
    whisperEl.style.opacity = 0;
    setTimeout(() => {
      whisperEl.textContent = whispers[wIndex];
      whisperEl.style.opacity = 1;
      wIndex = (wIndex + 1) % whispers.length;
    }, 800);
  }
  cycleWhisper();
  setInterval(cycleWhisper, 20000);

  // -----------------------------
  // Countdown → flash → reveal
  // -----------------------------
  function fmt(n) { return String(n).padStart(2, "0"); }

  function flashGlyphs() {
    const d = document.createElement("div");
    d.className = "flash-glyphs";
    d.textContent = "⟁ 𓂀 ☌ ∴ ⧖ ⌬";
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 1000);
  }

  function tick() {
    const diff = TARGET - Date.now();
    if (diff <= 0) {
      flashGlyphs();
      // If you have reveal.html, keep this; otherwise comment it out
      setTimeout(() => { window.location.href = "reveal.html"; }, 1000);
      return;
    }
    if (countEl) {
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      countEl.textContent = `${fmt(h)}:${fmt(m)}:${fmt(s)}`;
    }
    requestAnimationFrame(tick);
  }
  tick();

  // -----------------------------
  // ARM-gated audio (browser-safe)
  // -----------------------------
  armBtn?.addEventListener("click", () => {
    armBtn.textContent = "⟁";
    armBtn.disabled = true;
    try {
      if (hum) { hum.volume = 0.25; hum.loop = true; hum.play().catch(()=>{}); }
      if (chime) { setInterval(() => { chime.currentTime = 0; chime.play().catch(()=>{}); }, 8 * 60 * 1000); }
    } catch (_) {}
  });

  // -----------------------------
  // Starfield (works with #stars or #starfield; no-crash)
  // -----------------------------
  const canvas = document.getElementById("stars") || document.getElementById("starfield");
  const ctx = (canvas && canvas.getContext) ? canvas.getContext("2d") : null;

  if (ctx) {
    let w = 0, h = 0, stars = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      // reseed stars on resize
      stars = Array.from({ length: 140 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 1.5 + 0.5,
        d: Math.random() * 0.4 + 0.1,
        drift: (Math.random() - 0.5) * 0.2
      }));
    }
    window.addEventListener("resize", resize);
    resize();

    function drawStars() {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = "#fff";
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
  } else {
    // Not fatal—just no background
    console.warn('Starfield: no canvas with id "stars" or "starfield"');
  }

  // -----------------------------
  // Minimal telemetry (silent)
  // -----------------------------
  (function () {
    const key = "MAS_lg_telemetry";
    function log(evt, extra = {}) {
      try {
        const arr = JSON.parse(localStorage.getItem(key) || "[]");
        arr.push(Object.assign({ t: new Date().toISOString(), evt }, extra));
        localStorage.setItem(key, JSON.stringify(arr));
      } catch (_) {}
    }
    armBtn?.addEventListener("click", () => log("arm"));
    const _fg = flashGlyphs;
    window.flashGlyphs = function () { log("flash"); return _fg(); };
  })();
})();
