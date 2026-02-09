import sdk from '@stackblitz/sdk';

// A public stacked-alpha sample video URL for StackBlitz demos
const SAMPLE_VIDEO_URL = 'https://stepancar.github.io/alpha-video-kit/sample-stacked.mp4';

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

interface TabDef {
  label: string;
  code: string;
  stackblitz: {
    title: string;
    description: string;
    deps: Record<string, string>;
    indexHtml: string;
    mainTs: string;
  };
}

const SHARED_DEMO_STYLES = `
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: system-ui, sans-serif;
      background: #1a1a2e;
      color: #e4e4ef;
    }
    h1 { font-size: 24px; margin-bottom: 8px; }
    p { color: #8888a0; margin-bottom: 24px; }
    .panels {
      display: flex;
      gap: 32px;
      align-items: flex-start;
    }
    .panel {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .panel-label {
      font-size: 13px;
      color: #8888a0;
      margin-bottom: 8px;
    }
    .panel-label code { color: #a78bfa; }
    .source {
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #333;
      background: var(--bg, #222);
    }
    .source video { display: block; width: 200px; }
    .result {
      position: relative;
      background:
        repeating-conic-gradient(#2a2a3e 0% 25%, #1e1e30 0% 50%) 50% / 20px 20px;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #333;
    }
    .result canvas { display: block; width: 200px; height: 200px; }
    .arrow {
      font-size: 28px;
      color: #555;
      align-self: center;
      margin-top: 16px;
    }`;

const tabs: TabDef[] = [
  {
    label: 'WebGL',
    code: `<span class="comment">// Install</span>
<span class="keyword">npm install</span> <span class="string">@alpha-video-kit/webgl</span>

<span class="comment">// Option 1: Web Component (HTMLVideoElement-like API)</span>
<span class="keyword">import</span> <span class="string">'@alpha-video-kit/webgl/register'</span>;

&lt;alpha-video-kit-gl src=<span class="string">"video-stacked.mp4"</span>
  autoplay muted loop playsinline&gt;
&lt;/alpha-video-kit-gl&gt;

<span class="comment">// Option 2: Low-level API</span>
<span class="keyword">import</span> { createRenderer } <span class="keyword">from</span> <span class="string">'@alpha-video-kit/webgl'</span>;

<span class="keyword">const</span> renderer = createRenderer({ canvas });
renderer.drawFrame(videoElement);
renderer.destroy();`,
    stackblitz: {
      title: 'Alpha Video Kit — WebGL',
      description: 'Play transparent video on the web using @alpha-video-kit/webgl',
      deps: { '@alpha-video-kit/webgl': '^0.2.0' },
      indexHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Alpha Video Kit — WebGL Demo</title>
  <style>${SHARED_DEMO_STYLES}</style>
</head>
<body>
  <h1>WebGL Renderer</h1>
  <p>Transparent video rendered with <code>&lt;alpha-video-kit-gl&gt;</code></p>
  <div class="panels">
    <div class="panel">
      <div class="panel-label">Source <code>(stacked double-height)</code></div>
      <div class="source"><video id="video" autoplay muted loop playsinline></video></div>
    </div>
    <div class="arrow">&rarr;</div>
    <div class="panel">
      <div class="panel-label">Result <code>(transparent)</code></div>
      <div class="result"><alpha-video-kit-gl id="player" autoplay muted loop playsinline></alpha-video-kit-gl></div>
    </div>
  </div>
  <script type="module" src="./main.ts"></script>
</body>
</html>`,
      mainTs: `import '@alpha-video-kit/webgl/register';

const video = document.getElementById('video') as HTMLVideoElement;
const player = document.getElementById('player') as HTMLElement;

video.src = '${SAMPLE_VIDEO_URL}';
video.crossOrigin = 'anonymous';

(player as any).src = '${SAMPLE_VIDEO_URL}';
(player as any).crossOrigin = 'anonymous';
`,
    },
  },
  {
    label: 'WebGPU',
    code: `<span class="comment">// Install</span>
<span class="keyword">npm install</span> <span class="string">@alpha-video-kit/webgpu</span>

<span class="comment">// Option 1: Web Component (HTMLVideoElement-like API)</span>
<span class="keyword">import</span> <span class="string">'@alpha-video-kit/webgpu/register'</span>;

&lt;alpha-video-kit-gpu src=<span class="string">"video-stacked.mp4"</span>
  autoplay muted loop playsinline&gt;
&lt;/alpha-video-kit-gpu&gt;

<span class="comment">// Option 2: Low-level API (async)</span>
<span class="keyword">import</span> { createRenderer } <span class="keyword">from</span> <span class="string">'@alpha-video-kit/webgpu'</span>;

<span class="keyword">const</span> renderer = <span class="keyword">await</span> createRenderer({ canvas });
renderer.drawFrame(videoElement);
renderer.destroy();`,
    stackblitz: {
      title: 'Alpha Video Kit — WebGPU',
      description: 'Play transparent video on the web using @alpha-video-kit/webgpu',
      deps: { '@alpha-video-kit/webgpu': '^0.2.0' },
      indexHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Alpha Video Kit — WebGPU Demo</title>
  <style>${SHARED_DEMO_STYLES}
    .error { color: #fb923c; margin-top: 16px; }
  </style>
</head>
<body>
  <h1>WebGPU Renderer</h1>
  <p>Transparent video rendered with <code>&lt;alpha-video-kit-gpu&gt;</code></p>
  <div class="panels">
    <div class="panel">
      <div class="panel-label">Source <code>(stacked double-height)</code></div>
      <div class="source"><video id="video" autoplay muted loop playsinline></video></div>
    </div>
    <div class="arrow">&rarr;</div>
    <div class="panel">
      <div class="panel-label">Result <code>(transparent)</code></div>
      <div class="result"><alpha-video-kit-gpu id="player" autoplay muted loop playsinline></alpha-video-kit-gpu></div>
    </div>
  </div>
  <div id="error" class="error"></div>
  <script type="module" src="./main.ts"></script>
</body>
</html>`,
      mainTs: `import '@alpha-video-kit/webgpu/register';

const video = document.getElementById('video') as HTMLVideoElement;
const player = document.getElementById('player') as HTMLElement;

video.src = '${SAMPLE_VIDEO_URL}';
video.crossOrigin = 'anonymous';

(player as any).src = '${SAMPLE_VIDEO_URL}';
(player as any).crossOrigin = 'anonymous';
`,
    },
  },
  {
    label: 'SVG',
    code: `<span class="comment">// Install</span>
<span class="keyword">npm install</span> <span class="string">@alpha-video-kit/svg</span>

<span class="comment">// Option 1: Web Component (HTMLVideoElement-like API)</span>
<span class="keyword">import</span> <span class="string">'@alpha-video-kit/svg/register'</span>;

&lt;alpha-video-kit-svg src=<span class="string">"video-stacked.mp4"</span>
  autoplay muted loop playsinline mode=<span class="string">"canvas"</span>&gt;
&lt;/alpha-video-kit-svg&gt;

<span class="comment">// Option 2: Low-level API with mode selection</span>
<span class="keyword">import</span> { createRenderer } <span class="keyword">from</span> <span class="string">'@alpha-video-kit/svg'</span>;

<span class="comment">// 'canvas' (default) or 'svg-filter'</span>
<span class="keyword">const</span> renderer = createRenderer({ canvas, mode: <span class="string">'svg-filter'</span> });
renderer.drawFrame(videoElement);
renderer.destroy();`,
    stackblitz: {
      title: 'Alpha Video Kit — SVG Filter',
      description: 'Play transparent video on the web using @alpha-video-kit/svg',
      deps: { '@alpha-video-kit/svg': '^0.2.0' },
      indexHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Alpha Video Kit — SVG Filter Demo</title>
  <style>${SHARED_DEMO_STYLES}
    .controls {
      margin-top: 16px;
      display: flex;
      gap: 8px;
    }
    button {
      padding: 6px 16px;
      border-radius: 6px;
      border: 1px solid #444;
      background: #2a2a3e;
      color: #e4e4ef;
      cursor: pointer;
    }
    button.active {
      background: #7c5cfc;
      border-color: #7c5cfc;
    }
  </style>
</head>
<body>
  <h1>SVG / Canvas 2D Renderer</h1>
  <p>Transparent video rendered with <code>&lt;alpha-video-kit-svg&gt;</code></p>
  <div class="panels">
    <div class="panel">
      <div class="panel-label">Source <code>(stacked double-height)</code></div>
      <div class="source"><video id="video" autoplay muted loop playsinline></video></div>
    </div>
    <div class="arrow">&rarr;</div>
    <div class="panel">
      <div class="panel-label">Result <code>(transparent)</code></div>
      <div class="result"><alpha-video-kit-svg id="player" autoplay muted loop playsinline mode="canvas"></alpha-video-kit-svg></div>
    </div>
  </div>
  <div class="controls">
    <button id="btn-canvas" class="active">Canvas 2D mode</button>
    <button id="btn-svg">SVG Filter mode</button>
  </div>
  <script type="module" src="./main.ts"></script>
</body>
</html>`,
      mainTs: `import '@alpha-video-kit/svg/register';

const video = document.getElementById('video') as HTMLVideoElement;
const player = document.getElementById('player')!;

video.src = '${SAMPLE_VIDEO_URL}';
video.crossOrigin = 'anonymous';

(player as any).src = '${SAMPLE_VIDEO_URL}';
(player as any).crossOrigin = 'anonymous';

// Mode switcher
document.getElementById('btn-canvas')!.addEventListener('click', () => {
  player.setAttribute('mode', 'canvas');
  document.getElementById('btn-canvas')!.classList.add('active');
  document.getElementById('btn-svg')!.classList.remove('active');
});
document.getElementById('btn-svg')!.addEventListener('click', () => {
  player.setAttribute('mode', 'svg-filter');
  document.getElementById('btn-svg')!.classList.add('active');
  document.getElementById('btn-canvas')!.classList.remove('active');
});
`,
    },
  },
];

function openStackblitz(tab: TabDef) {
  sdk.openProject(
    {
      title: tab.stackblitz.title,
      description: tab.stackblitz.description,
      template: 'node',
      files: {
        'index.html': tab.stackblitz.indexHtml,
        'main.ts': tab.stackblitz.mainTs,
        'package.json': JSON.stringify(
          {
            name: tab.stackblitz.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            private: true,
            type: 'module',
            scripts: { dev: 'vite', build: 'vite build' },
            dependencies: tab.stackblitz.deps,
            devDependencies: { vite: '^6.0.0', typescript: '^5.6.0' },
          },
          null,
          2,
        ),
        'tsconfig.json': JSON.stringify(
          {
            compilerOptions: {
              target: 'ES2023',
              module: 'ESNext',
              moduleResolution: 'bundler',
              strict: true,
              esModuleInterop: true,
              skipLibCheck: true,
              lib: ['ES2023', 'DOM'],
            },
            include: ['.'],
          },
          null,
          2,
        ),
        'vite.config.ts': `import { defineConfig } from 'vite';\nexport default defineConfig({});`,
      },
    },
    { openFile: 'main.ts', newWindow: true },
  );
}

export function createApiDocsSection(): HTMLElement {
  const section = document.createElement('section');
  section.id = 'api';

  section.innerHTML = `
    <h2 class="section-title">Usage</h2>
    <p class="section-subtitle">All packages share the same API surface. Pick the one that fits your needs.</p>
    <div class="code-tabs" id="api-tabs"></div>
    <div class="code-block" id="api-code-block">
      <pre id="api-code"></pre>
      <button class="stackblitz-btn" id="api-stackblitz-btn">
        <svg width="16" height="16" viewBox="0 0 28 28" fill="none"><path d="M12.747 16.273h-7.46L18.925 1.5l-3.671 10.227h7.46L9.075 26.5l3.672-10.227z" fill="currentColor"/></svg>
        Open in StackBlitz
      </button>
    </div>
  `;

  requestAnimationFrame(() => {
    const tabsContainer = section.querySelector('#api-tabs')!;
    const codeEl = section.querySelector('#api-code')!;
    const stackblitzBtn = section.querySelector('#api-stackblitz-btn') as HTMLButtonElement;
    let activeIndex = 0;

    function setActive(index: number) {
      activeIndex = index;
      tabsContainer.querySelectorAll('.code-tab').forEach((t, i) => {
        t.classList.toggle('active', i === index);
      });
      codeEl.innerHTML = tabs[index].code;
    }

    tabs.forEach((tab, i) => {
      const tabEl = document.createElement('button');
      tabEl.className = 'code-tab';
      tabEl.textContent = tab.label;
      tabEl.addEventListener('click', () => setActive(i));
      tabsContainer.appendChild(tabEl);
    });

    stackblitzBtn.addEventListener('click', () => {
      openStackblitz(tabs[activeIndex]);
    });

    setActive(0);
  });

  return section;
}
