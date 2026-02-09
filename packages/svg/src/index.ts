export { createRenderer } from './renderer.js';
export { createSvgFilterRenderer } from './svg-filter-renderer.js';
export { createCanvasFilterRenderer } from './canvas-filter-renderer.js';
export { AlphaVideoKitSVG } from './component.js';
export type { StackedAlphaRenderer, StackedAlphaRendererOptions } from './types.js';
export type { SvgRendererMode, SvgRendererOptions } from './renderer.js';

declare global {
  interface HTMLElementTagNameMap {
    'alpha-video-kit-svg': import('./component.js').AlphaVideoKitSVG;
  }
}
