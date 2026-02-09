export function createComparisonSection(): HTMLElement {
  const section = document.createElement('section');
  section.id = 'comparison';

  section.innerHTML = `
    <h2 class="section-title">Renderer Comparison</h2>
    <p class="section-subtitle">Choose the right renderer for your use case.</p>

    <table class="comparison-table">
      <thead>
        <tr>
          <th>Feature</th>
          <th>WebGL</th>
          <th>WebGPU</th>
          <th>SVG Filter</th>
          <th>Canvas 2D</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Package</td>
          <td><code>@alpha-video-kit/webgl</code></td>
          <td><code>@alpha-video-kit/webgpu</code></td>
          <td colspan="2"><code>@alpha-video-kit/svg</code></td>
        </tr>
        <tr>
          <td>Browser Support</td>
          <td><span class="check">All modern</span></td>
          <td>Chrome, Edge, Safari 18+</td>
          <td><span class="check">All browsers</span></td>
          <td><span class="check">All browsers</span></td>
        </tr>
        <tr>
          <td>Rendering</td>
          <td>WebGL shader</td>
          <td>WebGPU shader</td>
          <td>CSS SVG filter on &lt;video&gt;</td>
          <td>CSS SVG filter on &lt;canvas&gt;</td>
        </tr>
        <tr>
          <td>Render Loop</td>
          <td><span class="check">rVFC / rAF</span></td>
          <td><span class="check">rVFC / rAF</span></td>
          <td><span class="check">None (browser)</span></td>
          <td><span class="check">rVFC / rAF</span></td>
        </tr>
        <tr>
          <td>Context Limits</td>
          <td><span class="cross">~8-16 per page</span></td>
          <td><span class="check">No practical limit</span></td>
          <td><span class="check">None</span></td>
          <td><span class="check">None</span></td>
        </tr>
        <tr>
          <td>Bundle Size</td>
          <td>~2 KB gzip</td>
          <td>~3 KB gzip</td>
          <td colspan="2">~1 KB gzip</td>
        </tr>
        <tr>
          <td>Web Component</td>
          <td><code>&lt;alpha-video-kit-gl&gt;</code></td>
          <td><code>&lt;alpha-video-kit-gpu&gt;</code></td>
          <td><code>&lt;alpha-video-kit-svg&gt;</code></td>
          <td><code>&lt;alpha-video-kit-canvas&gt;</code></td>
        </tr>
      </tbody>
    </table>
  `;

  return section;
}
