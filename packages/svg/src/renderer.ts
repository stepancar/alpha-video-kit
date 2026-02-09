import type { StackedAlphaRenderer, StackedAlphaRendererOptions } from './types.js';
import { createSvgFilterRenderer } from './svg-filter-renderer.js';

export function createRenderer(options: StackedAlphaRendererOptions): StackedAlphaRenderer {
  return createSvgFilterRenderer(options);
}
