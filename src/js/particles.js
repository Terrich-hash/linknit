/**
 * Interactive Ambient & Neural Constellation Background Canvas Effect
 * Custom created for linknit
 */

export function initParticles() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000, radius: 170 };

  // Ambient drifting gradient orbs
  let orbs = [
    { x: 0.2, y: 0.3, radius: 350, vx: 0.0003, vy: 0.0002, color: 'rgba(59, 130, 246, 0.12)' },
    { x: 0.8, y: 0.7, radius: 400, vx: -0.0002, vy: -0.0003, color: 'rgba(139, 92, 246, 0.1)' },
    { x: 0.5, y: 0.5, radius: 300, vx: 0.0004, vy: -0.0002, color: 'rgba(6, 182, 212, 0.08)' }
  ];

  function getThemeColors() {
    const style = getComputedStyle(document.documentElement);
    const accent = style.getPropertyValue('--accent-glow').trim() || '#3b82f6';
    const secondary = style.getPropertyValue('--accent-secondary').trim() || '#8b5cf6';
    return { accent, secondary };
  }

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    createParticles();
  }

  class Particle {
    constructor() {
      this.reset();
      this.x = Math.random() * width;
      this.y = Math.random() * height;
    }

    reset() {
      this.size = Math.random() * 2 + 1;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.speedY = (Math.random() - 0.5) * 0.5;
      this.baseOpacity = Math.random() * 0.4 + 0.2;
      this.pulseSpeed = Math.random() * 0.03 + 0.01;
      this.pulseAngle = Math.random() * Math.PI * 2;
    }

    update() {
      this.x += this.speedX;
      this.y += this.speedY;

      // Wrap around edges smoothly
      if (this.x < 0) this.x = width;
      if (this.x > width) this.x = 0;
      if (this.y < 0) this.y = height;
      if (this.y > height) this.y = 0;

      // Pulse opacity
      this.pulseAngle += this.pulseSpeed;
      this.opacity = this.baseOpacity + Math.sin(this.pulseAngle) * 0.15;

      // Interactive mouse physics
      if (mouse.x > 0 && mouse.y > 0) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 2;
          this.y -= (dy / dist) * force * 2;
        }
      }
    }

    draw(colors) {
      ctx.fillStyle = colors.accent;
      ctx.globalAlpha = Math.max(0.1, Math.min(1, this.opacity));
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    }
  }

  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor((width * height) / 14000), 70);
    for (let i = 0; i < count; i++) {
      particles.push(new Particle());
    }
  }

  function drawAmbientOrbs(colors) {
    orbs.forEach(orb => {
      orb.x += orb.vx;
      orb.y += orb.vy;
      if (orb.x < 0.1 || orb.x > 0.9) orb.vx *= -1;
      if (orb.y < 0.1 || orb.y > 0.9) orb.vy *= -1;

      const orbX = orb.x * width;
      const orbY = orb.y * height;
      const grad = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, orb.radius);
      grad.addColorStop(0, orb.color);
      grad.addColorStop(1, 'transparent');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, orb.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // Smooth mouse spotlight follow
    if (mouse.x > 0 && mouse.y > 0) {
      const mouseGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 220);
      mouseGrad.addColorStop(0, 'rgba(59, 130, 246, 0.08)');
      mouseGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = mouseGrad;
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 220, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function connect(colors) {
    const maxDist = 120;
    const mouseConnectDist = 150;

    // Connect node to node
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < maxDist) {
          const opacity = (1 - dist / maxDist) * 0.22;
          ctx.strokeStyle = colors.accent;
          ctx.globalAlpha = opacity;
          ctx.lineWidth = 0.9;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }

      // Connect node to mouse
      if (mouse.x > 0 && mouse.y > 0) {
        const mdx = particles[a].x - mouse.x;
        const mdy = particles[a].y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < mouseConnectDist) {
          const mOpacity = (1 - mdist / mouseConnectDist) * 0.35;
          ctx.strokeStyle = colors.secondary;
          ctx.globalAlpha = mOpacity;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }
    }
    ctx.globalAlpha = 1.0;
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Smooth mouse position easing
    mouse.x += (mouse.targetX - mouse.x) * 0.1;
    mouse.y += (mouse.targetY - mouse.y) * 0.1;

    const colors = getThemeColors();

    drawAmbientOrbs(colors);

    particles.forEach(p => {
      p.update();
      p.draw(colors);
    });

    connect(colors);

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.targetX = -1000;
    mouse.targetY = -1000;
  });

  resize();
  animate();
}
