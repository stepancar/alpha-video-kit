import { describe, it, expect, afterEach } from 'vitest';
import { StackedAlphaVideoGPU } from '../src/component.js';

if (!customElements.get('stacked-alpha-video-gpu')) {
  customElements.define('stacked-alpha-video-gpu', StackedAlphaVideoGPU);
}

describe('StackedAlphaVideoGPU Component', () => {
  let element: StackedAlphaVideoGPU;

  afterEach(() => {
    element?.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('stacked-alpha-video-gpu')).toBe(StackedAlphaVideoGPU);
  });

  it('should create element via constructor', () => {
    element = new StackedAlphaVideoGPU();
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it('should have a shadow root with canvas', () => {
    element = new StackedAlphaVideoGPU();
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot!.querySelector('canvas')).toBeTruthy();
  });

  it('should handle premultipliedAlpha property', () => {
    element = new StackedAlphaVideoGPU();
    expect(element.premultipliedAlpha).toBe(false);

    element.premultipliedAlpha = true;
    expect(element.premultipliedAlpha).toBe(true);

    element.premultipliedAlpha = false;
    expect(element.premultipliedAlpha).toBe(false);
  });

  it('should connect and disconnect without errors', () => {
    element = new StackedAlphaVideoGPU();
    document.body.appendChild(element);
    expect(element.isConnected).toBe(true);

    element.remove();
    expect(element.isConnected).toBe(false);
  });
});
