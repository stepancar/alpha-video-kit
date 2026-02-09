/**
 * Shared SVG filter for stacked-alpha compositing.
 *
 * The filter:
 * 1. feOffset dy=-0.5 — shifts the source up by half (bottom alpha mask → top position)
 * 2. feColorMatrix    — extracts R channel of shifted image as alpha
 * 3. feComposite "in" — masks the original source color with extracted alpha
 *
 * Applied to an element showing a stacked double-height video,
 * the result is the top half composited with transparency.
 * A container with overflow:hidden clips the transparent bottom half.
 */

export const FILTER_ID = 'avk-stacked-alpha';

let injected = false;

export function ensureSvgFilter(): void {
  if (injected) return;
  if (document.getElementById(FILTER_ID)) {
    injected = true;
    return;
  }
  injected = true;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
  svg.setAttribute('aria-hidden', 'true');
  svg.innerHTML = `<defs><filter id="${FILTER_ID}" filterUnits="objectBoundingBox" primitiveUnits="objectBoundingBox" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB"><feOffset in="SourceGraphic" dy="-0.5" result="s"/><feColorMatrix in="s" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0" result="a"/><feComposite in="SourceGraphic" in2="a" operator="in"/></filter></defs>`;
  document.body.prepend(svg);
}
