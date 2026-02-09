export { createRenderer } from './renderer.js';
export { AlphaVideoKitGL } from './component.js';
export type { StackedAlphaRenderer, StackedAlphaRendererOptions } from './types.js';

declare global {
  interface HTMLElementTagNameMap {
    'alpha-video-kit-gl': import('./component.js').AlphaVideoKitGL;
  }
}
