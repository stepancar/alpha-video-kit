import { createRenderer as createWebGLRenderer } from '@alpha-video-kit/webgl';
import { createRenderer as createSVGRenderer } from '@alpha-video-kit/svg';

interface DemoCard {
  title: string;
  badge: string;
  create: (canvas: HTMLCanvasElement) => { drawFrame: (v: HTMLVideoElement) => void; destroy: () => void } | null;
}

export function createLiveDemoSection(): HTMLElement {
  const section = document.createElement('section');
  section.id = 'demo';

  section.innerHTML = `
    <h2 class="section-title">Live Demo</h2>
    <p class="section-subtitle">
      See how a stacked-alpha video is decoded into transparent video using different renderers.
    </p>

    <div class="source-videos">
      <div class="source-video-card">
        <div class="source-video-label">Original video with alpha</div>
        <video id="original-video" autoplay muted loop playsinline
               style="max-width:100%;border-radius:8px;background:repeating-conic-gradient(#1a1a2a 0% 25%, #22223a 0% 50%) 50% / 16px 16px;"></video>
      </div>
      <div class="source-video-arrow">&rarr;</div>
      <div class="source-video-card">
        <div class="source-video-label">Stacked double-height (color + alpha mask)</div>
        <video id="stacked-video-preview" autoplay muted loop playsinline
               style="max-width:100%;border-radius:8px;background:var(--color-surface);"></video>
      </div>
      <div class="source-video-arrow">&rarr;</div>
      <div class="source-video-card">
        <div class="source-video-label">Rendered with transparency</div>
        <canvas id="preview-canvas"
                style="max-width:100%;border-radius:8px;background:repeating-conic-gradient(#1a1a2a 0% 25%, #22223a 0% 50%) 50% / 16px 16px;"></canvas>
      </div>
    </div>

    <h3 style="font-size:20px;margin-top:60px;margin-bottom:8px;color:var(--color-text);">Renderer Comparison</h3>
    <p style="font-size:14px;color:var(--color-text-muted);margin-bottom:20px;">
      The same stacked video rendered by each backend. Checkerboard = transparency.
    </p>

    <div class="demo-controls" id="demo-global-controls">
      <button id="demo-play-btn" class="active">Play</button>
      <button id="demo-pause-btn">Pause</button>
      <label style="margin-left:auto;font-size:13px;color:var(--color-text-muted);display:flex;align-items:center;gap:6px;">
        Custom video URL:
        <input id="demo-video-url" type="text" value=""
               placeholder="Paste stacked-alpha video URL"
               style="width:240px;padding:4px 10px;border-radius:6px;border:1px solid var(--color-border);background:var(--color-surface-2);color:var(--color-text);font-size:13px;" />
      </label>
    </div>
    <div class="demo-container" id="demo-cards"></div>
  `;

  // Source videos: original with alpha + stacked version
  const originalVideoEl = section.querySelector('#original-video') as HTMLVideoElement;
  const stackedPreviewEl = section.querySelector('#stacked-video-preview') as HTMLVideoElement;
  const previewCanvas = section.querySelector('#preview-canvas') as HTMLCanvasElement;

  originalVideoEl.src = new URL('../../public/original-alpha.webm', import.meta.url).href;
  stackedPreviewEl.src = new URL('../../public/sample-stacked.mp4', import.meta.url).href;

  // Render the preview canvas using WebGL from the stacked video
  let previewRenderer: ReturnType<typeof createWebGLRenderer> | null = null;
  stackedPreviewEl.addEventListener('loadeddata', () => {
    try {
      previewRenderer = createWebGLRenderer({ canvas: previewCanvas });
    } catch { /* */ }
  });

  function renderPreview() {
    if (previewRenderer && stackedPreviewEl.readyState >= 2) {
      previewRenderer.drawFrame(stackedPreviewEl);
    }
    requestAnimationFrame(renderPreview);
  }
  requestAnimationFrame(renderPreview);

  // Main demo video (hidden, feeds all renderer cards)
  const video = document.createElement('video');
  video.crossOrigin = 'anonymous';
  video.loop = true;
  video.muted = true;
  video.playsInline = true;
  video.src = new URL('../../public/sample-stacked.mp4', import.meta.url).href;

  const cards: DemoCard[] = [
    {
      title: 'WebGL',
      badge: 'GPU',
      create(canvas) {
        try {
          return createWebGLRenderer({ canvas });
        } catch {
          return null;
        }
      },
    },
    {
      title: 'Canvas 2D',
      badge: 'CPU',
      create(canvas) {
        try {
          return createSVGRenderer({ canvas, mode: 'canvas' });
        } catch {
          return null;
        }
      },
    },
    {
      title: 'SVG Filter',
      badge: 'CPU',
      create(canvas) {
        try {
          return createSVGRenderer({ canvas, mode: 'svg-filter' });
        } catch {
          return null;
        }
      },
    },
  ];

  requestAnimationFrame(() => {
    const container = section.querySelector('#demo-cards')!;
    const renderers: Array<{ drawFrame: (v: HTMLVideoElement) => void; destroy: () => void } | null> = [];
    const fpsElements: HTMLElement[] = [];

    cards.forEach((card) => {
      const el = document.createElement('div');
      el.className = 'demo-card';

      const canvas = document.createElement('canvas');
      canvas.style.maxWidth = '100%';
      canvas.style.maxHeight = '100%';

      el.innerHTML = `
        <div class="demo-card-header">
          <span class="demo-card-title">${card.title}</span>
          <span class="demo-card-badge">${card.badge}</span>
        </div>
      `;

      const wrapper = document.createElement('div');
      wrapper.className = 'demo-canvas-wrapper';
      wrapper.appendChild(canvas);

      const fps = document.createElement('div');
      fps.className = 'demo-fps';
      fps.textContent = '-- fps';
      wrapper.appendChild(fps);
      fpsElements.push(fps);

      el.appendChild(wrapper);
      container.appendChild(el);

      const renderer = card.create(canvas);
      renderers.push(renderer);
    });

    const frameCounts = cards.map(() => 0);
    const lastFpsTimes = cards.map(() => performance.now());

    let rafId: number;

    function renderLoop() {
      if (video.readyState >= 2) {
        renderers.forEach((renderer, i) => {
          if (renderer) {
            renderer.drawFrame(video);
            frameCounts[i]++;
            const now = performance.now();
            const elapsed = now - lastFpsTimes[i];
            if (elapsed >= 1000) {
              const fps = Math.round((frameCounts[i] * 1000) / elapsed);
              fpsElements[i].textContent = `${fps} fps`;
              frameCounts[i] = 0;
              lastFpsTimes[i] = now;
            }
          }
        });
      }
      rafId = requestAnimationFrame(renderLoop);
    }

    video.addEventListener('loadeddata', () => {
      renderLoop();
      video.play().catch(() => {});
    });

    if (video.readyState >= 2) {
      renderLoop();
      video.play().catch(() => {});
    }

    const playBtn = section.querySelector('#demo-play-btn') as HTMLButtonElement;
    const pauseBtn = section.querySelector('#demo-pause-btn') as HTMLButtonElement;
    const urlInput = section.querySelector('#demo-video-url') as HTMLInputElement;

    playBtn.addEventListener('click', () => {
      video.play().catch(() => {});
      playBtn.classList.add('active');
      pauseBtn.classList.remove('active');
    });

    pauseBtn.addEventListener('click', () => {
      video.pause();
      pauseBtn.classList.add('active');
      playBtn.classList.remove('active');
    });

    urlInput.addEventListener('change', () => {
      const url = urlInput.value.trim();
      if (url) {
        video.src = url;
        video.load();
      }
    });

    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(rafId);
      renderers.forEach((r) => r?.destroy());
    });
  });

  return section;
}
