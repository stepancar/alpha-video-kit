import { describe, it, expect, afterEach } from 'vitest';
import { createRenderer } from '../src/renderer.js';

describe('WebGL Renderer', () => {
  let canvas: HTMLCanvasElement;

  afterEach(() => {
    canvas?.remove();
  });

  it('should create a renderer', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas });
    expect(renderer).toBeDefined();
    expect(renderer.isDestroyed).toBe(false);
    renderer.destroy();
  });

  it('should mark as destroyed after destroy()', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas });
    renderer.destroy();
    expect(renderer.isDestroyed).toBe(true);
  });

  it('should accept premultipliedAlpha option', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas, premultipliedAlpha: true });
    expect(renderer).toBeDefined();
    renderer.destroy();
  });

  it('should allow setPremultipliedAlpha', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas });
    expect(() => renderer.setPremultipliedAlpha(true)).not.toThrow();
    expect(() => renderer.setPremultipliedAlpha(false)).not.toThrow();
    renderer.destroy();
  });

  it('should not throw when calling drawFrame after destroy', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas });
    renderer.destroy();

    const video = document.createElement('video');
    expect(() => renderer.drawFrame(video)).not.toThrow();
  });
});
