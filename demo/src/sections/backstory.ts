export function createBackstorySection(): HTMLElement {
  const section = document.createElement('section');
  section.id = 'backstory';
  section.innerHTML = `
    <h2 class="section-title">Backstory</h2>
    <p class="section-subtitle">How this project came to be.</p>

    <div class="timeline">
      <div class="timeline-item">
        <h3>Two-Video Approach</h3>
        <p>
          The original idea was to load two separate videos: one with RGB color data
          and another with the alpha mask. Each played in sync to composite transparent
          video on the web. However, keeping two video elements perfectly synchronized
          proved unreliable &mdash; even small timing drifts caused visible artifacts
          at transparency edges.
        </p>
      </div>

      <div class="timeline-item">
        <h3>Stacked Frames</h3>
        <p>
          The synchronization issues led to a better approach: combine both color and
          alpha into a single video at double height. The top half carries the RGB data,
          the bottom half carries the alpha mask as grayscale. A single video element
          means perfect frame-level synchronization &mdash; no drift, no glitches.
        </p>
      </div>

      <div class="timeline-item">
        <h3>Archibald's Implementation</h3>
        <p>
          After developing this concept, we discovered Jake Archibald had published
          <a href="https://github.com/nickytonline/stacked-alpha-video"
             target="_blank" style="color: var(--color-accent-light);">stacked-alpha-video</a>
          &mdash; an elegant Web Component using WebGL shaders. However, it creates
          a separate WebGL context per video element. Browsers limit active WebGL
          contexts to roughly 8&ndash;16, so pages with many transparent videos would
          lose contexts and break rendering.
        </p>
      </div>

      <div class="timeline-item">
        <h3>Alpha Video Kit</h3>
        <p>
          This monorepo addresses those limitations with multiple rendering backends:
          WebGL (with visibility-based context management), WebGPU (no context limits),
          and SVG filters (pure CPU fallback). Each is published as an independent npm
          package under <code>@alpha-video-kit</code>. This demo also includes a
          video converter powered by ffmpeg.wasm so you can generate stacked-alpha
          videos right in the browser.
        </p>
      </div>
    </div>
  `;
  return section;
}
