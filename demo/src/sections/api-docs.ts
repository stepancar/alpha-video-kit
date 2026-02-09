import { openStackblitz } from '../open-stackblitz.js';

interface TabDef {
  label: string;
  code: string;
  exampleDir: string;
  openFile?: string;
}

const tabs: TabDef[] = [
  {
    label: 'WebGL',
    exampleDir: 'webgl',
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
  },
  {
    label: 'WebGPU',
    exampleDir: 'webgpu',
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
  },
  {
    label: 'SVG',
    exampleDir: 'svg',
    code: `<span class="comment">// Install</span>
<span class="keyword">npm install</span> <span class="string">@alpha-video-kit/svg</span>

<span class="comment">// Two components — same SVG filter, different targets</span>
<span class="keyword">import</span> <span class="string">'@alpha-video-kit/svg/register'</span>;

<span class="comment">// SVG filter on &lt;video&gt; (no canvas, no render loop)</span>
&lt;alpha-video-kit-svg src=<span class="string">"video-stacked.mp4"</span>
  autoplay muted loop playsinline /&gt;

<span class="comment">// SVG filter on &lt;canvas&gt; (drawImage + render loop)</span>
&lt;alpha-video-kit-canvas src=<span class="string">"video-stacked.mp4"</span>
  autoplay muted loop playsinline /&gt;`,
  },
  {
    label: 'React',
    exampleDir: 'react',
    openFile: 'src/App.tsx',
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
  },
];

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
      const tab = tabs[activeIndex];
      openStackblitz(tab.exampleDir, tab.openFile);
    });

    setActive(0);
  });

  return section;
}
