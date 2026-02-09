import { describe, it, expect, afterEach } from 'vitest';
import { StackedAlphaVideoSVG } from '../src/component.js';

if (!customElements.get('stacked-alpha-video-svg')) {
  customElements.define('stacked-alpha-video-svg', StackedAlphaVideoSVG);
}

describe('StackedAlphaVideoSVG Component', () => {
  let element: StackedAlphaVideoSVG;

  afterEach(() => {
    element?.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('stacked-alpha-video-svg')).toBe(StackedAlphaVideoSVG);
  });

  it('should create element via constructor', () => {
    element = new StackedAlphaVideoSVG();
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it('should have a shadow root with canvas', () => {
    element = new StackedAlphaVideoSVG();
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot!.querySelector('canvas')).toBeTruthy();
  });

  it('should handle premultipliedAlpha property', () => {
    element = new StackedAlphaVideoSVG();
    expect(element.premultipliedAlpha).toBe(false);

    element.premultipliedAlpha = true;
    expect(element.premultipliedAlpha).toBe(true);

    element.premultipliedAlpha = false;
    expect(element.premultipliedAlpha).toBe(false);
  });

  it('should connect and disconnect without errors', () => {
    element = new StackedAlphaVideoSVG();
    document.body.appendChild(element);
    expect(element.isConnected).toBe(true);

    element.remove();
    expect(element.isConnected).toBe(false);
  });
});
