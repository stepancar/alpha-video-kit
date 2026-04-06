/**
 * Canvas 2D + SVG filter fallback for when WebGL is unavailable.
 *
 * Uses an inline SVG filter (feOffset + feColorMatrix + feComposite)
 * to extract alpha from the bottom half of a stacked-alpha video
 * and composite it with the top half color data.
 *
 * NOTE: Does NOT work on macOS/Safari — Safari does not support
 * ctx.filter with SVG url() references.
 */

const SVG_NS = 'http://www.w3.org/2000/svg';

interface SharedCanvas2DContext {
  filterId: string;
  filterEl: SVGFilterElement;
  feOffsetEl: SVGFEOffsetElement;
  svgRoot: SVGSVGElement;
  tmpCanvas: HTMLCanvasElement;
  tmpCtx: CanvasRenderingContext2D;
  currentW: number;
  currentFullH: number;
  refCount: number;
}

let shared: SharedCanvas2DContext | null = null;

function init(): SharedCanvas2DContext {
  if (shared) {
    shared.refCount++;
    return shared;
  }

  const filterId = `avk-c2d-${Math.random().toString(36).slice(2, 8)}`;

  const svgRoot = document.createElementNS(SVG_NS, 'svg');
  svgRoot.setAttribute('width', '0');
  svgRoot.setAttribute('height', '0');
  svgRoot.style.position = 'absolute';
  svgRoot.style.pointerEvents = 'none';

  const filterEl = document.createElementNS(SVG_NS, 'filter');
  filterEl.setAttribute('id', filterId);
  filterEl.setAttribute('filterUnits', 'userSpaceOnUse');
  filterEl.setAttribute('color-interpolation-filters', 'sRGB');
  filterEl.setAttribute('x', '0');
  filterEl.setAttribute('y', '0');
  filterEl.setAttribute('width', '1');
  filterEl.setAttribute('height', '1');

  const feOffsetEl = document.createElementNS(SVG_NS, 'feOffset');
  feOffsetEl.setAttribute('in', 'SourceGraphic');
  feOffsetEl.setAttribute('dy', '0');
  feOffsetEl.setAttribute('result', 's');

  const feColorMatrix = document.createElementNS(SVG_NS, 'feColorMatrix');
  feColorMatrix.setAttribute('in', 's');
  feColorMatrix.setAttribute('type', 'matrix');
  // Extract R channel as alpha, zero out RGB
  feColorMatrix.setAttribute('values', '0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0');
  feColorMatrix.setAttribute('result', 'a');

  const feComposite = document.createElementNS(SVG_NS, 'feComposite');
  feComposite.setAttribute('in', 'SourceGraphic');
  feComposite.setAttribute('in2', 'a');
  feComposite.setAttribute('operator', 'in');

  filterEl.append(feOffsetEl, feColorMatrix, feComposite);
  svgRoot.appendChild(filterEl);
  document.body.appendChild(svgRoot);

  const tmpCanvas = document.createElement('canvas');
  const tmpCtx = tmpCanvas.getContext('2d')!;

  shared = {
    filterId,
    filterEl,
    feOffsetEl,
    svgRoot,
    tmpCanvas,
    tmpCtx,
    currentW: 0,
    currentFullH: 0,
    refCount: 1,
  };
  return shared;
}

function updateFilterDimensions(ctx: SharedCanvas2DContext, w: number, fullH: number): void {
  if (ctx.currentW === w && ctx.currentFullH === fullH) return;
  ctx.currentW = w;
  ctx.currentFullH = fullH;
  const halfH = Math.floor(fullH / 2);

  ctx.filterEl.setAttribute('width', String(w));
  ctx.filterEl.setAttribute('height', String(fullH));
  ctx.feOffsetEl.setAttribute('dy', String(-halfH));

  ctx.tmpCanvas.width = w;
  ctx.tmpCanvas.height = fullH;
}

export function processFrameCanvas2D(
  ctx: SharedCanvas2DContext,
  video: HTMLVideoElement,
  destCanvas: HTMLCanvasElement,
  destCtx: CanvasRenderingContext2D,
): void {
  const w = video.videoWidth;
  const fullH = video.videoHeight;
  const halfH = Math.floor(fullH / 2);

  if (destCanvas.width !== w || destCanvas.height !== halfH) {
    destCanvas.width = w;
    destCanvas.height = halfH;
  }

  updateFilterDimensions(ctx, w, fullH);

  // Clear temp canvas without filter, then draw with filter
  ctx.tmpCtx.filter = 'none';
  ctx.tmpCtx.clearRect(0, 0, w, fullH);
  ctx.tmpCtx.filter = `url(#${ctx.filterId})`;
  ctx.tmpCtx.drawImage(video, 0, 0);
  ctx.tmpCtx.filter = 'none';

  // Copy top half to destination
  destCtx.clearRect(0, 0, w, halfH);
  destCtx.drawImage(ctx.tmpCanvas, 0, 0, w, halfH, 0, 0, w, halfH);
}

export function acquireCanvas2D(): SharedCanvas2DContext {
  return init();
}

export function releaseCanvas2D(ctx: SharedCanvas2DContext): void {
  if (ctx !== shared) return;
  ctx.refCount--;
  if (ctx.refCount <= 0) {
    ctx.svgRoot.remove();
    shared = null;
  }
}

export type { SharedCanvas2DContext };
