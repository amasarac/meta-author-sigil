const backend = {
  logEvent: (...args) => window.ORBiSBackend?.logEvent?.(...args),
  syncState: (...args) => window.ORBiSBackend?.syncState?.(...args),
};

class StarManifold {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.rotationScalar = 1;
    this.pulseEnabled = true;
    this.starCount = 140;
    this.stars = [];
    this.lastFrame = 0;
    this.resizeObserver = null;

    this.init();
  }

  init() {
    this.generateStars();
    this.handleResize();
    window.addEventListener('resize', () => this.handleResize());

    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => this.handleResize());
      this.resizeObserver.observe(this.canvas.parentElement);
    }

    backend.logEvent('star-manifold:init', { stars: this.starCount });
    requestAnimationFrame((timestamp) => this.animate(timestamp));
  }

  generateStars() {
    this.stars = new Array(this.starCount).fill(null).map((_, index) => {
      const layer = index / this.starCount;
      return {
        distance: 0.15 + Math.pow(layer, 1.6) * 0.85,
        angle: Math.random() * Math.PI * 2,
        baseSpeed: 0.08 + Math.random() * 0.6,
        radius: 1 + Math.random() * 2.2,
        hue: 180 + Math.random() * 60,
        twinkleOffset: Math.random() * Math.PI * 2,
      };
    });
  }

  handleResize() {
    const { width, height } = this.canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = width * ratio;
    this.canvas.height = height * ratio;
    this.ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  animate(timestamp) {
    const delta = this.lastFrame ? (timestamp - this.lastFrame) / 1000 : 0;
    this.lastFrame = timestamp;

    this.clearCanvas();
    this.drawNebula(timestamp);
    this.drawStars(delta, timestamp);
    this.drawConstellation(timestamp);

    requestAnimationFrame((t) => this.animate(t));
  }

  clearCanvas() {
    const { width, height } = this.canvas;
    this.ctx.clearRect(0, 0, width, height);
  }

  drawNebula(timestamp) {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    const gradient = ctx.createRadialGradient(
      width * 0.55,
      height * 0.35,
      Math.min(width, height) * 0.05,
      width * 0.5,
      height * 0.5,
      Math.max(width, height) * 0.65
    );
    const pulse = this.pulseEnabled ? 0.08 * Math.sin(timestamp / 900) : 0;

    gradient.addColorStop(0, `rgba(120, 248, 255, ${0.25 + pulse})`);
    gradient.addColorStop(0.35, 'rgba(45, 110, 198, 0.35)');
    gradient.addColorStop(1, 'rgba(2, 6, 18, 0.9)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  drawStars(delta, timestamp) {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;

    this.stars.forEach((star, index) => {
      const speed = star.baseSpeed * this.rotationScalar;
      star.angle += speed * delta;

      const orbitRadius = Math.min(centerX, centerY) * star.distance;
      const pulse = this.pulseEnabled ? 1 + 0.06 * Math.sin(timestamp / 450 + star.twinkleOffset) : 1;
      const x = centerX + Math.cos(star.angle) * orbitRadius * pulse;
      const y = centerY + Math.sin(star.angle) * orbitRadius * pulse * 0.72;

      const gradient = ctx.createRadialGradient(x, y, 0, x, y, star.radius * 6);
      gradient.addColorStop(0, `hsla(${star.hue}, 85%, 70%, 0.95)`);
      gradient.addColorStop(0.45, `hsla(${star.hue + 15}, 85%, 60%, 0.45)`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, star.radius * (1.3 + Math.sin(timestamp / 620 + star.twinkleOffset) * 0.25), 0, Math.PI * 2);
      ctx.fill();

      if (index % 12 === 0) {
        this.drawGlyphTrail(ctx, x, y, star, timestamp);
      }
    });
  }

  drawGlyphTrail(ctx, x, y, star, timestamp) {
    const trailLength = 18;
    const intensity = this.pulseEnabled ? 0.45 : 0.28;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(star.angle);

    const gradient = ctx.createLinearGradient(0, 0, trailLength * -1.5, trailLength);
    gradient.addColorStop(0, `hsla(${star.hue}, 80%, 70%, ${intensity})`);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-trailLength, trailLength * 0.25 + Math.sin(timestamp / 320) * 2);
    ctx.stroke();
    ctx.restore();
  }

  drawConstellation(timestamp) {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const pulse = this.pulseEnabled ? 0.6 + Math.sin(timestamp / 700) * 0.15 : 0.6;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.sin(timestamp / 1100) * 0.15);

    const radii = [0.18, 0.32, 0.45];
    radii.forEach((radiusFactor, idx) => {
      const radius = Math.min(centerX, centerY) * radiusFactor * (1 + pulse * 0.1 * idx);
      ctx.beginPath();
      ctx.setLineDash([12 - idx * 3, 14 + idx * 2]);
      ctx.lineDashOffset = timestamp / (320 + idx * 120);
      ctx.lineWidth = 1.2 + idx * 0.4;
      ctx.strokeStyle = `rgba(150, 245, 255, ${0.16 + idx * 0.08})`;
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
    });

    ctx.restore();
  }

  setRotationScalar(value) {
    this.rotationScalar = value;
    backend.syncState('star-manifold:rotation', { rotationScalar: value });
  }

  setPulse(enabled) {
    this.pulseEnabled = enabled;
    backend.syncState('star-manifold:pulse', { enabled });
  }
}

function setupControls(manifold) {
  const speedSlider = document.getElementById('rotation-speed');
  const speedDisplay = document.getElementById('rotation-speed-display');
  const pulseToggle = document.getElementById('pulse-toggle');

  if (speedSlider && speedDisplay) {
    const initialValue = parseFloat(speedSlider.value);
    speedDisplay.textContent = `${initialValue.toFixed(2)}x`;
    manifold.setRotationScalar(initialValue);
    speedSlider.addEventListener('input', () => {
      const value = parseFloat(speedSlider.value);
      manifold.setRotationScalar(value);
      speedDisplay.textContent = `${value.toFixed(2)}x`;
      backend.logEvent('star-manifold:control-change', { control: 'rotation', value });
    });
  }

  if (pulseToggle) {
    manifold.setPulse(pulseToggle.checked);
    pulseToggle.addEventListener('change', () => {
      manifold.setPulse(pulseToggle.checked);
      backend.logEvent('star-manifold:control-change', { control: 'pulse', value: pulseToggle.checked });
    });
  }
}

function setupPortalButton() {
  const button = document.getElementById('enter-orbis');
  if (!button) return;

  button.addEventListener('click', (event) => {
    event.preventDefault();
    if (button.classList.contains('is-animating')) return;

    const target = button.getAttribute('data-target');
    button.classList.add('is-animating');
    document.body.classList.add('portal-transition');
    backend.logEvent('star-manifold:portal-engage', { target });

    setTimeout(() => {
      if (target) {
        window.location.href = target;
      } else {
        button.classList.remove('is-animating');
        document.body.classList.remove('portal-transition');
      }
    }, 900);
  });
}

function initialize() {
  const canvas = document.getElementById('star-manifold');
  if (!canvas) {
    console.warn('Star manifold canvas not found.');
    return;
  }

  const manifold = new StarManifold(canvas);
  setupControls(manifold);
  setupPortalButton();
}

document.addEventListener('DOMContentLoaded', initialize);
