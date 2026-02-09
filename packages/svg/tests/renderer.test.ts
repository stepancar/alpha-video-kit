import { describe, it, expect, afterEach } from 'vitest';
import { createRenderer, createCanvasFilterRenderer } from '../src/index.js';

describe('SVG Renderer', () => {
  let canvas: HTMLCanvasElement;

  afterEach(() => {
    canvas?.remove();
  });

  it('should create a canvas renderer by default', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas });
    expect(renderer).toBeDefined();
    expect(renderer.isDestroyed).toBe(false);
    renderer.destroy();
  });

  it('should create a svg-filter renderer', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas, mode: 'svg-filter' });
    expect(renderer).toBeDefined();
    expect(renderer.isDestroyed).toBe(false);
    renderer.destroy();
  });

  it('should create a canvas filter renderer directly', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createCanvasFilterRenderer({ canvas });
    expect(renderer).toBeDefined();
    renderer.destroy();
  });

  it('should mark as destroyed after destroy()', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas });
    renderer.destroy();
    expect(renderer.isDestroyed).toBe(true);
  });

  it('should allow setPremultipliedAlpha', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas });
    expect(() => renderer.setPremultipliedAlpha(true)).not.toThrow();
    renderer.destroy();
  });
});
