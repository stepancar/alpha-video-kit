import type { StackedAlphaRenderer, StackedAlphaRendererOptions } from './types.js';

const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * SVG filter renderer using ctx.filter on Canvas 2D.
 *
 * Uses an offscreen canvas at full (double) height so the filter can see
 * both halves. The filter composites alpha, then the top half is copied
 * to the visible canvas.
 */
export function createSvgFilterRenderer(
  options: StackedAlphaRendererOptions,
): StackedAlphaRenderer {
  const { canvas } = options;
  const ctx = (canvas as HTMLCanvasElement).getContext('2d')!;

  const offscreen = document.createElement('canvas');
  const offCtx = offscreen.getContext('2d')!;

  const filterId = `avk-f-${Math.random().toString(36).slice(2, 8)}`;
  let filterSvg: SVGSVGElement | null = null;
  let filter: SVGFilterElement | null = null;
  let feOffset: SVGFEOffsetElement | null = null;
  let destroyed = false;

  function ensureFilter() {
    if (filterSvg) return;

    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('width', '0');
    svg.setAttribute('height', '0');
    svg.style.cssText = 'position:absolute;overflow:hidden';

    const defs = document.createElementNS(SVG_NS, 'defs');

    const f = document.createElementNS(SVG_NS, 'filter');
    f.id = filterId;
    f.setAttribute('filterUnits', 'userSpaceOnUse');
    f.setAttribute('x', '0');
    f.setAttribute('y', '0');
    f.setAttribute('width', '1');
    f.setAttribute('height', '1');
    f.setAttribute('color-interpolation-filters', 'sRGB');

    const fo = document.createElementNS(SVG_NS, 'feOffset');
    fo.setAttribute('in', 'SourceGraphic');
    fo.setAttribute('dy', '0');
    fo.setAttribute('result', 's');

    const cm = document.createElementNS(SVG_NS, 'feColorMatrix');
    cm.setAttribute('in', 's');
    cm.setAttribute('type', 'matrix');
    cm.setAttribute('values', '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0');
    cm.setAttribute('result', 'a');

    const comp = document.createElementNS(SVG_NS, 'feComposite');
    comp.setAttribute('in', 'SourceGraphic');
    comp.setAttribute('in2', 'a');
    comp.setAttribute('operator', 'in');

    f.append(fo, cm, comp);
    defs.appendChild(f);
    svg.appendChild(defs);
    document.body.appendChild(svg);

    filterSvg = svg;
    filter = f;
    feOffset = fo;
  }

  return {
    drawFrame(video: HTMLVideoElement) {
      if (destroyed) return;

      const w = video.videoWidth;
      const fullH = video.videoHeight;
      const halfH = Math.floor(fullH / 2);

      if (canvas.width !== w || canvas.height !== halfH) {
        canvas.width = w;
        canvas.height = halfH;
      }

      if (offscreen.width !== w || offscreen.height !== fullH) {
        offscreen.width = w;
        offscreen.height = fullH;
      }

      ensureFilter();
      filter!.setAttribute('width', String(w));
      filter!.setAttribute('height', String(fullH));
      feOffset!.setAttribute('dy', String(-halfH));

      // Draw full video with filter on offscreen (full height)
      offCtx.clearRect(0, 0, w, fullH);
      offCtx.filter = `url(#${filterId})`;
      offCtx.drawImage(video, 0, 0);

      // Copy top half (with correct alpha) to visible canvas
      ctx.clearRect(0, 0, w, halfH);
      ctx.drawImage(offscreen, 0, 0, w, halfH, 0, 0, w, halfH);
    },

    setPremultipliedAlpha(_value: boolean) {
      // SVG filter handles alpha compositing directly
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      filterSvg?.remove();
      filterSvg = null;
      filter = null;
      feOffset = null;
    },

    get isDestroyed() {
      return destroyed;
    },
  };
}
