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
          <th>SVG / Canvas 2D</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Package</td>
          <td><code>@stacked-alpha-video/webgl</code></td>
          <td><code>@stacked-alpha-video/webgpu</code></td>
          <td><code>@stacked-alpha-video/svg</code></td>
        </tr>
        <tr>
          <td>Browser Support</td>
          <td><span class="check">All modern</span></td>
          <td>Chrome, Edge, Safari 18+</td>
          <td><span class="check">All browsers</span></td>
        </tr>
        <tr>
          <td>GPU Accelerated</td>
          <td><span class="check">Yes</span></td>
          <td><span class="check">Yes</span></td>
          <td><span class="cross">No (CPU)</span></td>
        </tr>
        <tr>
          <td>Context Limits</td>
          <td><span class="cross">~8-16 per page</span></td>
          <td><span class="check">No practical limit</span></td>
          <td><span class="check">None</span></td>
        </tr>
        <tr>
          <td>Performance</td>
          <td><span class="check">Excellent</span></td>
          <td><span class="check">Excellent</span></td>
          <td>Moderate</td>
        </tr>
        <tr>
          <td>Bundle Size</td>
          <td>~2 KB gzip</td>
          <td>~3 KB gzip</td>
          <td>~1 KB gzip</td>
        </tr>
        <tr>
          <td>Web Component</td>
          <td><code>&lt;stacked-alpha-video-gl&gt;</code></td>
          <td><code>&lt;stacked-alpha-video-gpu&gt;</code></td>
          <td><code>&lt;stacked-alpha-video-svg&gt;</code></td>
        </tr>
        <tr>
          <td>Premultiplied Alpha</td>
          <td><span class="check">Yes</span></td>
          <td><span class="check">Yes</span></td>
          <td><span class="check">Yes</span></td>
        </tr>
        <tr>
          <td>Rendering Modes</td>
          <td>WebGL / WebGL2</td>
          <td>WebGPU</td>
          <td>Pure SVG filter, Canvas 2D</td>
        </tr>
      </tbody>
    </table>
  `;

  return section;
}
