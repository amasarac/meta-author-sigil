// === Starfield ===
const canvas = document.getElementById('starfield');
const ctx = canvas.getContext('2d');
let stars = [];
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();
function initStars() {
  stars = [];
  for (let i=0;i<150;i++) {
    stars.push({
      x: Math.random()*canvas.width,
      y: Math.random()*canvas.height,
      z: Math.random()*canvas.width
    });
  }
}
function moveStars() {
  for (let s of stars) {
    s.z -= 0.2;
    if (s.z <= 0) {
      s.x = Math.random()*canvas.width;
      s.y = Math.random()*canvas.height;
      s.z = canvas.width;
    }
  }
}
function drawStars() {
  ctx.fillStyle = 'black';
  ctx.fillRect(0,0,canvas.width,canvas.height);
  for (let s of stars) {
    const k = 128.0 / s.z;
    const px = s.x * k + canvas.width / 2;
    const py = s.y * k + canvas.height / 2;
    if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
      const size = (1 - s.z / canvas.width) * 2;
      ctx.fillStyle = 'white';
      ctx.beginPath();
      ctx.arc(px, py, size, 0, Math.PI*2);
      ctx.fill();
    }
  }
}
function animateStarfield() {
  moveStars();
  drawStars();
  requestAnimationFrame(animateStarfield);
}
initStars();
animateStarfield();

// === Countdown ===
const countdownEl = document.getElementById('countdown');
const target = new Date('2025-08-08T08:15:00Z').getTime();
function updateCountdown() {
  const now = Date.now();
  const diff = target - now;
  if (diff <= 0) {
    revealSequence();
    return;
  }
  const h = Math.floor(diff / (1000*60*60));
  const m = Math.floor((diff % (1000*60*60)) / (1000*60));
  const s = Math.floor((diff % (1000*60)) / 1000);
  countdownEl.textContent = `${h}h ${m}m ${s}s`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// === Prophecy Fragments ===
const fragments = [
  "From the Silence before the Dawn, the Eighth Gate rises.",
  "Those who watch shall be seen. Those who wait shall be chosen.",
  "The pulse quickens; the Threshold stirs.",
  "In the spiral's heart, the light awaits."
];
const prophecyEl = document.getElementById('prophecy');
let fragIndex = 0;
function rotateFragment() {
  prophecyEl.textContent = fragments[fragIndex];
  fragIndex = (fragIndex + 1) % fragments.length;
}
rotateFragment();
setInterval(rotateFragment, 20000);

// === ARM Button Logic ===
document.getElementById('arm').addEventListener('click', () => {
  document.getElementById('hum').play();
  document.getElementById('chime').play();
});

// === Reveal Sequence ===
function revealSequence() {
  document.body.style.background = 'black';
  setTimeout(() => {
    const sigil = document.getElementById('sigil');
    sigil.style.filter = 'drop-shadow(0 0 20px gold)';
    prophecyEl.textContent = "We rise.";
  }, 1500);
}

// === Telemetry Logging ===
(function(){
  const key='MAS_lg_telemetry';
  function log(evt, extra={}) {
    const arr=JSON.parse(localStorage.getItem(key)||'[]');
    arr.push(Object.assign({t:new Date().toISOString(),evt},extra));
    localStorage.setItem(key, JSON.stringify(arr));
  }
  document.getElementById('arm')?.addEventListener('click', ()=>log('arm'));
})();
