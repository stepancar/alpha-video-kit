import type { StackedAlphaRenderer, StackedAlphaRendererOptions } from './types.js';
import { acquire, release, processFrame, type SharedGLContext } from './shared-webgl.js';

/**
 * Renderer that uses a shared WebGL canvas for alpha compositing,
 * then copies the result to the user's 2D canvas.
 *
 * This avoids the 16 WebGL context limit (single shared context)
 * and works in Safari (unlike ctx.filter with SVG url() references).
 */
export function createSvgFilterRenderer(
  options: StackedAlphaRendererOptions,
): StackedAlphaRenderer {
  const { canvas } = options;
  const ctx = (canvas as HTMLCanvasElement).getContext('2d')!;

  let glCtx: SharedGLContext = acquire();
  let destroyed = false;

  return {
    drawFrame(video: HTMLVideoElement) {
      if (destroyed) return;
      processFrame(glCtx, video, canvas as HTMLCanvasElement, ctx);
    },

    setPremultipliedAlpha(_value: boolean) {
      // Handled by the WebGL shader
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      release(glCtx);
    },

    get isDestroyed() {
      return destroyed;
    },
  };
}
