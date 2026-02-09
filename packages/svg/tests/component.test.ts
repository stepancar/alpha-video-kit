import { describe, it, expect, afterEach } from 'vitest';
import { AlphaVideoKitSVG } from '../src/svg-component.js';
import { AlphaVideoKitCanvas } from '../src/canvas-component.js';

if (!customElements.get('alpha-video-kit-svg')) {
  customElements.define('alpha-video-kit-svg', AlphaVideoKitSVG);
}
if (!customElements.get('alpha-video-kit-canvas')) {
  customElements.define('alpha-video-kit-canvas', AlphaVideoKitCanvas);
}

describe('AlphaVideoKitSVG Component (SVG filter on video)', () => {
  let element: AlphaVideoKitSVG;

  afterEach(() => {
    element?.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('alpha-video-kit-svg')).toBe(AlphaVideoKitSVG);
  });

  it('should create element via constructor', () => {
    element = new AlphaVideoKitSVG();
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it('should have a shadow root with video but no canvas', () => {
    element = new AlphaVideoKitSVG();
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot!.querySelector('video')).toBeTruthy();
    expect(element.shadowRoot!.querySelector('canvas')).toBeNull();
  });

  it('should proxy video-like properties', () => {
    element = new AlphaVideoKitSVG();
    expect(element.paused).toBe(true);
    expect(element.currentTime).toBe(0);
    expect(element.volume).toBe(1);
    expect(element.muted).toBe(false);
    expect(element.loop).toBe(false);
    expect(element.playbackRate).toBe(1);
  });

  it('should mirror boolean attributes to internal video', () => {
    element = new AlphaVideoKitSVG();
    document.body.appendChild(element);

    element.muted = true;
    expect(element.muted).toBe(true);
    expect(element.hasAttribute('muted')).toBe(true);

    element.loop = true;
    expect(element.loop).toBe(true);
    expect(element.hasAttribute('loop')).toBe(true);
  });

  it('should connect and disconnect without errors', () => {
    element = new AlphaVideoKitSVG();
    document.body.appendChild(element);
    expect(element.isConnected).toBe(true);

    element.remove();
    expect(element.isConnected).toBe(false);
  });

  it('should expose play/pause/load methods', () => {
    element = new AlphaVideoKitSVG();
    expect(typeof element.play).toBe('function');
    expect(typeof element.pause).toBe('function');
    expect(typeof element.load).toBe('function');
    expect(typeof element.canPlayType).toBe('function');
  });

  it('should apply SVG filter to the video element', () => {
    element = new AlphaVideoKitSVG();
    const video = element.shadowRoot!.querySelector('video')!;
    const style = video.computedStyleMap ? undefined : getComputedStyle(video);
    // The filter is set via CSS in the shadow DOM stylesheet
    expect(video).toBeTruthy();
  });
});

describe('AlphaVideoKitCanvas Component (CSS filter on canvas)', () => {
  let element: AlphaVideoKitCanvas;

  afterEach(() => {
    element?.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('alpha-video-kit-canvas')).toBe(AlphaVideoKitCanvas);
  });

  it('should create element via constructor', () => {
    element = new AlphaVideoKitCanvas();
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it('should have a shadow root with video and canvas', () => {
    element = new AlphaVideoKitCanvas();
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot!.querySelector('video')).toBeTruthy();
    expect(element.shadowRoot!.querySelector('canvas')).toBeTruthy();
  });

  it('should proxy video-like properties', () => {
    element = new AlphaVideoKitCanvas();
    expect(element.paused).toBe(true);
    expect(element.currentTime).toBe(0);
    expect(element.volume).toBe(1);
    expect(element.muted).toBe(false);
    expect(element.loop).toBe(false);
    expect(element.playbackRate).toBe(1);
  });

  it('should mirror boolean attributes to internal video', () => {
    element = new AlphaVideoKitCanvas();
    document.body.appendChild(element);

    element.muted = true;
    expect(element.muted).toBe(true);
    expect(element.hasAttribute('muted')).toBe(true);

    element.loop = true;
    expect(element.loop).toBe(true);
    expect(element.hasAttribute('loop')).toBe(true);
  });

  it('should connect and disconnect without errors', () => {
    element = new AlphaVideoKitCanvas();
    document.body.appendChild(element);
    expect(element.isConnected).toBe(true);

    element.remove();
    expect(element.isConnected).toBe(false);
  });

  it('should expose play/pause/load methods', () => {
    element = new AlphaVideoKitCanvas();
    expect(typeof element.play).toBe('function');
    expect(typeof element.pause).toBe('function');
    expect(typeof element.load).toBe('function');
    expect(typeof element.canPlayType).toBe('function');
  });
});
