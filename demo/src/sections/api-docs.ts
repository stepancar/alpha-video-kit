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
    devDeps?: Record<string, string>;
    indexHtml: string;
    mainFile?: string; // default: 'main.ts'
    mainContent: string;
    extraFiles?: Record<string, string>;
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
    .result > * { display: block; width: 200px; height: 200px; }
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
      mainContent: `// Register the custom element
import '@alpha-video-kit/webgl/register';

// Import the type for typed access (HTMLElementTagNameMap is also augmented)
import type { AlphaVideoKitGL } from '@alpha-video-kit/webgl';

const video = document.getElementById('video') as HTMLVideoElement;
const player = document.getElementById('player') as AlphaVideoKitGL;

video.src = '${SAMPLE_VIDEO_URL}';
video.crossOrigin = 'anonymous';

// Fully typed — .src, .crossOrigin, .play(), etc.
player.src = '${SAMPLE_VIDEO_URL}';
player.crossOrigin = 'anonymous';
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
      mainContent: `// Register the custom element
import '@alpha-video-kit/webgpu/register';

// Import the type for typed access
import type { AlphaVideoKitGPU } from '@alpha-video-kit/webgpu';

const video = document.getElementById('video') as HTMLVideoElement;
const player = document.getElementById('player') as AlphaVideoKitGPU;

video.src = '${SAMPLE_VIDEO_URL}';
video.crossOrigin = 'anonymous';

// Fully typed — .src, .crossOrigin, .play(), etc.
player.src = '${SAMPLE_VIDEO_URL}';
player.crossOrigin = 'anonymous';
`,
    },
  },
  {
    label: 'SVG',
    code: `<span class="comment">// Install</span>
<span class="keyword">npm install</span> <span class="string">@alpha-video-kit/svg</span>

<span class="comment">// Two components — same SVG filter, different targets</span>
<span class="keyword">import</span> <span class="string">'@alpha-video-kit/svg/register'</span>;

<span class="comment">// SVG filter on &lt;video&gt; (no canvas, no render loop)</span>
&lt;alpha-video-kit-svg src=<span class="string">"video-stacked.mp4"</span>
  autoplay muted loop playsinline /&gt;

<span class="comment">// SVG filter on &lt;canvas&gt; (drawImage + CSS filter)</span>
&lt;alpha-video-kit-canvas src=<span class="string">"video-stacked.mp4"</span>
  autoplay muted loop playsinline /&gt;`,
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
    .result > * { width: 200px; }
  </style>
</head>
<body>
  <h1>SVG Filter Renderers</h1>
  <p>Two components from <code>@alpha-video-kit/svg</code></p>
  <div class="panels">
    <div class="panel">
      <div class="panel-label">Source <code>(stacked)</code></div>
      <div class="source"><video id="video" autoplay muted loop playsinline></video></div>
    </div>
    <div class="arrow">&rarr;</div>
    <div class="panel">
      <div class="panel-label"><code>&lt;alpha-video-kit-svg&gt;</code></div>
      <div class="result"><alpha-video-kit-svg id="player-svg" autoplay muted loop playsinline></alpha-video-kit-svg></div>
    </div>
    <div class="arrow">&rarr;</div>
    <div class="panel">
      <div class="panel-label"><code>&lt;alpha-video-kit-canvas&gt;</code></div>
      <div class="result"><alpha-video-kit-canvas id="player-canvas" autoplay muted loop playsinline></alpha-video-kit-canvas></div>
    </div>
  </div>
  <script type="module" src="./main.ts"></script>
</body>
</html>`,
      mainContent: `// Register both custom elements
import '@alpha-video-kit/svg/register';

// Import types for typed access
import type { AlphaVideoKitSVG, AlphaVideoKitCanvas } from '@alpha-video-kit/svg';

const video = document.getElementById('video') as HTMLVideoElement;
const svgPlayer = document.getElementById('player-svg') as AlphaVideoKitSVG;
const canvasPlayer = document.getElementById('player-canvas') as AlphaVideoKitCanvas;

video.src = '${SAMPLE_VIDEO_URL}';
video.crossOrigin = 'anonymous';

// Both components have the same HTMLVideoElement-like API
svgPlayer.src = '${SAMPLE_VIDEO_URL}';
svgPlayer.crossOrigin = 'anonymous';

canvasPlayer.src = '${SAMPLE_VIDEO_URL}';
canvasPlayer.crossOrigin = 'anonymous';
`,
    },
  },
  {
    label: 'React',
    code: `<span class="comment">// Install</span>
<span class="keyword">npm install</span> <span class="string">@alpha-video-kit/webgl @alpha-video-kit/webgpu @alpha-video-kit/svg</span>

<span class="comment">// 1. Add JSX types — create alpha-video-kit.d.ts</span>
<span class="comment">/// &lt;reference types="@alpha-video-kit/webgl/react" /&gt;</span>
<span class="comment">/// &lt;reference types="@alpha-video-kit/webgpu/react" /&gt;</span>
<span class="comment">/// &lt;reference types="@alpha-video-kit/svg/react" /&gt;</span>

<span class="comment">// 2. Register elements &amp; use in JSX</span>
<span class="keyword">import</span> <span class="string">'@alpha-video-kit/webgl/register'</span>;

&lt;alpha-video-kit-gl
  src=<span class="string">"video-stacked.mp4"</span>
  autoPlay muted loop playsInline /&gt;`,
    stackblitz: {
      title: 'Alpha Video Kit — React',
      description: 'Use alpha-video-kit custom elements in React with full JSX types',
      deps: {
        'react': '^19.0.0',
        'react-dom': '^19.0.0',
        '@alpha-video-kit/webgl': '^0.2.0',
        '@alpha-video-kit/webgpu': '^0.2.0',
        '@alpha-video-kit/svg': '^0.2.0',
      },
      devDeps: {
        'vite': '^6.0.0',
        'typescript': '^5.6.0',
        '@vitejs/plugin-react': '^4.0.0',
        '@types/react': '^19.0.0',
        '@types/react-dom': '^19.0.0',
      },
      indexHtml: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Alpha Video Kit — React Demo</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./src/main.tsx"></script>
</body>
</html>`,
      mainFile: 'src/App.tsx',
      mainContent: `import { useRef } from 'react';

// Register all custom elements
import '@alpha-video-kit/webgl/register';
import '@alpha-video-kit/webgpu/register';
import '@alpha-video-kit/svg/register';

// Types are provided by .d.ts triple-slash references
// See src/alpha-video-kit.d.ts for how to set up JSX types
import type { AlphaVideoKitGL } from '@alpha-video-kit/webgl';

const VIDEO_URL = '${SAMPLE_VIDEO_URL}';

const checkerBg = 'repeating-conic-gradient(#2a2a3e 0% 25%, #1e1e30 0% 50%) 50% / 20px 20px';

export default function App() {
  // refs are typed — try hovering glRef!
  const glRef = useRef<AlphaVideoKitGL>(null);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif', background: '#1a1a2e', color: '#e4e4ef',
    }}>
      <h1>React + Alpha Video Kit</h1>
      <p style={{ color: '#8888a0' }}>
        All three renderers as JSX elements with full type safety
      </p>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Card title="WebGL" badge="GPU">
          <alpha-video-kit-gl
            ref={glRef}
            src={VIDEO_URL}
            crossOrigin="anonymous"
            autoPlay muted loop playsInline
            style={{ width: 240, height: 240, background: checkerBg, borderRadius: 12 }}
          />
        </Card>

        <Card title="WebGPU" badge="GPU">
          <alpha-video-kit-gpu
            src={VIDEO_URL}
            crossOrigin="anonymous"
            autoPlay muted loop playsInline
            style={{ width: 240, height: 240, background: checkerBg, borderRadius: 12 }}
          />
        </Card>

        <Card title="SVG Filter" badge="CPU">
          <alpha-video-kit-svg
            src={VIDEO_URL}
            crossOrigin="anonymous"
            autoPlay muted loop playsInline
            style={{ width: 240, background: checkerBg, borderRadius: 12 }}
          />
        </Card>

        <Card title="Canvas 2D" badge="CPU">
          <alpha-video-kit-canvas
            src={VIDEO_URL}
            crossOrigin="anonymous"
            autoPlay muted loop playsInline
            style={{ width: 240, background: checkerBg, borderRadius: 12 }}
          />
        </Card>
      </div>

      <p style={{ color: '#555', fontSize: 13, marginTop: 32 }}>
        Check <code style={{ color: '#a78bfa' }}>src/alpha-video-kit.d.ts</code> to see how JSX types are enabled
      </p>
    </div>
  );
}

function Card({ title, badge, children }: {
  title: string; badge: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 600 }}>{title}</span>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 4,
          background: '#7c5cfc33', color: '#a78bfa',
        }}>{badge}</span>
      </div>
      {children}
    </div>
  );
}
`,
      extraFiles: {
        'src/main.tsx': `import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(<App />);
`,
        'src/alpha-video-kit.d.ts': `// This file enables JSX types for alpha-video-kit custom elements.
// Add triple-slash references to the packages you use:

/// <reference types="@alpha-video-kit/webgl/react" />
/// <reference types="@alpha-video-kit/webgpu/react" />
/// <reference types="@alpha-video-kit/svg/react" />

// That's it! Now you can use <alpha-video-kit-gl>, <alpha-video-kit-gpu>,
// and <alpha-video-kit-svg> in JSX with full type checking and autocompletion.
`,
        'vite.config.ts': `import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
`,
      },
    },
  },
];

function openStackblitz(tab: TabDef) {
  const sb = tab.stackblitz;
  const mainFile = sb.mainFile || 'main.ts';
  const devDeps = sb.devDeps || { vite: '^6.0.0', typescript: '^5.6.0' };

  const files: Record<string, string> = {
    'index.html': sb.indexHtml,
    [mainFile]: sb.mainContent,
    'package.json': JSON.stringify(
      {
        name: sb.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        private: true,
        type: 'module',
        scripts: { dev: 'vite', build: 'vite build' },
        dependencies: sb.deps,
        devDependencies: devDeps,
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
          jsx: 'react-jsx',
          lib: ['ES2023', 'DOM'],
        },
        include: ['src', '.'],
      },
      null,
      2,
    ),
  };

  // Add vite.config.ts only if not already in extraFiles
  if (!sb.extraFiles?.['vite.config.ts']) {
    files['vite.config.ts'] = `import { defineConfig } from 'vite';\nexport default defineConfig({});`;
  }

  // Merge extra files
  if (sb.extraFiles) {
    Object.assign(files, sb.extraFiles);
  }

  sdk.openProject(
    { title: sb.title, description: sb.description, template: 'node', files },
    { openFile: mainFile, newWindow: true },
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
