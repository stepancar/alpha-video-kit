import type { StackedAlphaRenderer, StackedAlphaRendererOptions } from './types.js';

/**
 * Canvas 2D renderer with pixel manipulation.
 * Draws the video to an offscreen canvas, reads pixels from top and bottom halves,
 * applies alpha from the bottom half to the top half's color data.
 * No SVG filters used — pure Canvas 2D fallback for maximum compatibility.
 */
export function createCanvasFilterRenderer(
  options: StackedAlphaRendererOptions,
): StackedAlphaRenderer {
  const { canvas, premultipliedAlpha = false } = options;
  const ctx = (canvas as HTMLCanvasElement).getContext('2d', { willReadFrequently: true })!;

  const offscreen = document.createElement('canvas');
  const offCtx = offscreen.getContext('2d', { willReadFrequently: true })!;

  let destroyed = false;
  let premul = premultipliedAlpha;

  return {
    drawFrame(video: HTMLVideoElement) {
      if (destroyed) return;

      const width = video.videoWidth;
      const fullHeight = video.videoHeight;
      const halfHeight = Math.floor(fullHeight / 2);

      if (canvas.width !== width || canvas.height !== halfHeight) {
        canvas.width = width;
        canvas.height = halfHeight;
      }

      if (offscreen.width !== width || offscreen.height !== fullHeight) {
        offscreen.width = width;
        offscreen.height = fullHeight;
      }

      // Draw the full double-height video frame
      offCtx.drawImage(video, 0, 0);

      // Read top half (color) and bottom half (alpha)
      const colorData = offCtx.getImageData(0, 0, width, halfHeight);
      const alphaData = offCtx.getImageData(0, halfHeight, width, halfHeight);

      const pixels = colorData.data;
      const alphaPixels = alphaData.data;

      for (let i = 0; i < pixels.length; i += 4) {
        const alpha = alphaPixels[i]; // R channel of alpha region
        if (premul) {
          pixels[i + 3] = alpha;
        } else {
          const a = alpha / 255;
          pixels[i] = Math.round(pixels[i] * a);
          pixels[i + 1] = Math.round(pixels[i + 1] * a);
          pixels[i + 2] = Math.round(pixels[i + 2] * a);
          pixels[i + 3] = alpha;
        }
      }

      ctx.putImageData(colorData, 0, 0);
    },

    setPremultipliedAlpha(value: boolean) {
      premul = value;
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
    },

    get isDestroyed() {
      return destroyed;
    },
  };
}
