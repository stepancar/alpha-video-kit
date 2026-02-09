export { createRenderer } from './renderer.js';
export { AlphaVideoKitGPU } from './component.js';
export type { StackedAlphaRenderer, StackedAlphaRendererOptions } from './types.js';

declare global {
  interface HTMLElementTagNameMap {
    'alpha-video-kit-gpu': import('./component.js').AlphaVideoKitGPU;
  }
}
