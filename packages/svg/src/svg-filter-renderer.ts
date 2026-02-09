import type { StackedAlphaRenderer, StackedAlphaRendererOptions } from './types.js';

/**
 * Pure SVG filter renderer.
 * Renders each frame by drawing the video to a temporary canvas to get a data URL,
 * then uses an SVG with filter-based alpha extraction and masking.
 */
export function createSvgFilterRenderer(
  options: StackedAlphaRendererOptions,
): StackedAlphaRenderer {
  const { canvas } = options;
  const ctx = (canvas as HTMLCanvasElement).getContext('2d')!;

  const sourceCanvas = document.createElement('canvas');
  const sourceCtx = sourceCanvas.getContext('2d')!;

  let destroyed = false;

  function buildSvg(sourceDataUrl: string, width: number, halfHeight: number, fullHeight: number) {
    return `<svg xmlns="http://www.w3.org/2000/svg"
                 xmlns:xlink="http://www.w3.org/1999/xlink"
                 width="${width}" height="${halfHeight}"
                 viewBox="0 0 ${width} ${halfHeight}">
              <defs>
                <filter id="r2a" color-interpolation-filters="sRGB">
                  <feColorMatrix type="matrix"
                    values="0 0 0 0 1
                            0 0 0 0 1
                            0 0 0 0 1
                            1 0 0 0 0"/>
                </filter>
                <mask id="alphaMask">
                  <svg viewBox="0 ${halfHeight} ${width} ${halfHeight}"
                       width="${width}" height="${halfHeight}"
                       preserveAspectRatio="none">
                    <image href="${sourceDataUrl}"
                           width="${width}" height="${fullHeight}"
                           filter="url(#r2a)"/>
                  </svg>
                </mask>
              </defs>
              <svg viewBox="0 0 ${width} ${halfHeight}"
                   width="${width}" height="${halfHeight}"
                   preserveAspectRatio="none"
                   mask="url(#alphaMask)">
                <image href="${sourceDataUrl}"
                       width="${width}" height="${fullHeight}"/>
              </svg>
            </svg>`;
  }

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

      if (sourceCanvas.width !== width || sourceCanvas.height !== fullHeight) {
        sourceCanvas.width = width;
        sourceCanvas.height = fullHeight;
      }

      // Draw video frame to source canvas to get data URL
      sourceCtx.drawImage(video, 0, 0);
      const dataUrl = sourceCanvas.toDataURL('image/png');

      const svgStr = buildSvg(dataUrl, width, halfHeight, fullHeight);
      const blob = new Blob([svgStr], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);

      const img = new Image();
      img.onload = () => {
        if (destroyed) {
          URL.revokeObjectURL(url);
          return;
        }
        ctx.clearRect(0, 0, width, halfHeight);
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
      };
      img.src = url;
    },

    setPremultipliedAlpha(_value: boolean) {
      // SVG filter handles alpha compositing directly
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
