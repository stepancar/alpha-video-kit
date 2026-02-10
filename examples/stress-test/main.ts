import '@alpha-video-kit/webgl/register';
import { autopause } from '@alpha-video-kit/autopause';

const VIDEO_SRC = 'https://stepancar.github.io/alpha-video-kit/sample-stacked.mp4';
const TOTAL = 300;

const grid = document.getElementById('grid')!;
const statTotal = document.getElementById('stat-total')!;
const statVisible = document.getElementById('stat-visible')!;
const statFps = document.getElementById('stat-fps')!;

// --- Create 300 elements ---
statTotal.textContent = String(TOTAL);

for (let i = 0; i < TOTAL; i++) {
  const cell = document.createElement('div');
  cell.className = 'cell';

  const player = document.createElement('alpha-video-kit-gl');
  player.setAttribute('src', VIDEO_SRC);
  player.setAttribute('crossorigin', 'anonymous');
  player.setAttribute('autoplay', '');
  player.setAttribute('muted', '');
  player.setAttribute('loop', '');
  player.setAttribute('playsinline', '');

  cell.appendChild(player);
  grid.appendChild(cell);
  autopause(player);
}

// --- Visible count via IntersectionObserver ---
let visibleCount = 0;

const observer = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        visibleCount++;
      } else {
        visibleCount--;
      }
    }
    statVisible.textContent = String(visibleCount);
  },
  { threshold: 0 }
);

for (const el of grid.querySelectorAll('alpha-video-kit-gl')) {
  observer.observe(el);
}

// --- FPS counter ---
let frames = 0;
let lastTime = performance.now();

function tick(now: number) {
  frames++;
  if (now - lastTime >= 1000) {
    statFps.textContent = String(frames);
    frames = 0;
    lastTime = now;
  }
  requestAnimationFrame(tick);
}

requestAnimationFrame(tick);
