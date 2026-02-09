import type { StackedAlphaRenderer, StackedAlphaRendererOptions } from './types.js';
import { createSvgFilterRenderer } from './svg-filter-renderer.js';
import { createCanvasFilterRenderer } from './canvas-filter-renderer.js';

export type SvgRendererMode = 'svg-filter' | 'canvas';

export interface SvgRendererOptions extends StackedAlphaRendererOptions {
  mode?: SvgRendererMode;
}

export function createRenderer(options: SvgRendererOptions): StackedAlphaRenderer {
  const { mode = 'canvas', ...baseOptions } = options;

  if (mode === 'svg-filter') {
    return createSvgFilterRenderer(baseOptions);
  }

  return createCanvasFilterRenderer(baseOptions);
}
