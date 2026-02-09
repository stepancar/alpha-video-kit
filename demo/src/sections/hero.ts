export function createHeroSection(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'hero';
  section.innerHTML = `
    <h1 class="section-title">Alpha Video Kit</h1>
    <p class="section-subtitle">
      Play transparent video on the web using the stacked-alpha technique.
      Multiple rendering backends. Zero dependencies. Tiny bundle.
    </p>
    <div class="hero-badges">
      <span class="badge accent">WebGL</span>
      <span class="badge accent">WebGPU</span>
      <span class="badge accent">SVG Filter</span>
      <span class="badge">TypeScript</span>
      <span class="badge">Web Components</span>
    </div>

    <div class="concept-diagram">
      <div class="concept-box">
        <div class="concept-box-label">Stacked Video (2x height)</div>
        <div class="concept-half color">RGB Color Data</div>
        <div class="concept-half alpha">Alpha Mask (grayscale)</div>
      </div>
      <div class="concept-arrow">&rarr;</div>
      <div class="concept-box">
        <div class="concept-box-label">Rendered Output</div>
        <div class="concept-result">Transparent Video</div>
      </div>
    </div>
  `;
  return section;
}
