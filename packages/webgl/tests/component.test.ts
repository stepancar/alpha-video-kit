import { describe, it, expect, afterEach } from 'vitest';
import { StackedAlphaVideoGL } from '../src/component.js';

// Register the custom element for tests
if (!customElements.get('stacked-alpha-video-gl')) {
  customElements.define('stacked-alpha-video-gl', StackedAlphaVideoGL);
}

describe('StackedAlphaVideoGL Component', () => {
  let element: StackedAlphaVideoGL;

  afterEach(() => {
    element?.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('stacked-alpha-video-gl')).toBe(StackedAlphaVideoGL);
  });

  it('should create element via constructor', () => {
    element = new StackedAlphaVideoGL();
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it('should create element via document.createElement', () => {
    element = document.createElement('stacked-alpha-video-gl') as StackedAlphaVideoGL;
    expect(element).toBeInstanceOf(StackedAlphaVideoGL);
  });

  it('should have a shadow root with canvas', () => {
    element = new StackedAlphaVideoGL();
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot!.querySelector('canvas')).toBeTruthy();
  });

  it('should handle premultipliedAlpha property', () => {
    element = new StackedAlphaVideoGL();
    expect(element.premultipliedAlpha).toBe(false);

    element.premultipliedAlpha = true;
    expect(element.premultipliedAlpha).toBe(true);
    expect(element.hasAttribute('premultipliedalpha')).toBe(true);

    element.premultipliedAlpha = false;
    expect(element.premultipliedAlpha).toBe(false);
    expect(element.hasAttribute('premultipliedalpha')).toBe(false);
  });

  it('should connect and disconnect without errors', () => {
    element = new StackedAlphaVideoGL();
    document.body.appendChild(element);
    expect(element.isConnected).toBe(true);

    element.remove();
    expect(element.isConnected).toBe(false);
  });
});
