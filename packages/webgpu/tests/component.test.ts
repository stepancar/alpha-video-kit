import { describe, it, expect, afterEach } from 'vitest';
import { AlphaVideoKitGPU } from '../src/component.js';

if (!customElements.get('alpha-video-kit-gpu')) {
  customElements.define('alpha-video-kit-gpu', AlphaVideoKitGPU);
}

describe('AlphaVideoKitGPU Component', () => {
  let element: AlphaVideoKitGPU;

  afterEach(() => {
    element?.remove();
  });

  it('should be defined as a custom element', () => {
    expect(customElements.get('alpha-video-kit-gpu')).toBe(AlphaVideoKitGPU);
  });

  it('should create element via constructor', () => {
    element = new AlphaVideoKitGPU();
    expect(element).toBeInstanceOf(HTMLElement);
  });

  it('should have a shadow root with video and canvas', () => {
    element = new AlphaVideoKitGPU();
    expect(element.shadowRoot).toBeTruthy();
    expect(element.shadowRoot!.querySelector('canvas')).toBeTruthy();
    expect(element.shadowRoot!.querySelector('video')).toBeTruthy();
  });

  it('should proxy video-like properties', () => {
    element = new AlphaVideoKitGPU();
    expect(element.paused).toBe(true);
    expect(element.currentTime).toBe(0);
    expect(element.volume).toBe(1);
    expect(element.muted).toBe(false);
    expect(element.loop).toBe(false);
    expect(element.playbackRate).toBe(1);
  });

  it('should mirror boolean attributes to internal video', () => {
    element = new AlphaVideoKitGPU();
    document.body.appendChild(element);

    element.muted = true;
    expect(element.muted).toBe(true);
    expect(element.hasAttribute('muted')).toBe(true);

    element.loop = true;
    expect(element.loop).toBe(true);
    expect(element.hasAttribute('loop')).toBe(true);
  });

  it('should connect and disconnect without errors', () => {
    element = new AlphaVideoKitGPU();
    document.body.appendChild(element);
    expect(element.isConnected).toBe(true);

    element.remove();
    expect(element.isConnected).toBe(false);
  });

  it('should expose play/pause/load methods', () => {
    element = new AlphaVideoKitGPU();
    expect(typeof element.play).toBe('function');
    expect(typeof element.pause).toBe('function');
    expect(typeof element.load).toBe('function');
    expect(typeof element.canPlayType).toBe('function');
  });
});
