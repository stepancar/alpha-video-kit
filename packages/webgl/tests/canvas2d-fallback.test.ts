import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';

// Mutable flag to control isSafari mock per-test
let isSafariValue = false;

vi.mock('../src/platform.js', () => ({
  isSafari: () => isSafariValue,
}));

import { createRenderer } from '../src/renderer.js';
import { AlphaVideoKitGL } from '../src/component.js';

if (!customElements.get('alpha-video-kit-gl')) {
  customElements.define('alpha-video-kit-gl', AlphaVideoKitGL);
}

const originalGetContext = HTMLCanvasElement.prototype.getContext;

function blockWebGL() {
  HTMLCanvasElement.prototype.getContext = function (
    this: HTMLCanvasElement,
    contextId: string,
    ...args: unknown[]
  ) {
    if (contextId === 'webgl' || contextId === 'webgl2') return null;
    return (originalGetContext as (...a: unknown[]) => unknown).call(this, contextId, ...args);
  } as typeof HTMLCanvasElement.prototype.getContext;
}

function restoreWebGL() {
  HTMLCanvasElement.prototype.getContext = originalGetContext;
}

function cleanupSvgFilters() {
  document.querySelectorAll('svg').forEach((el) => {
    if (el.querySelector('filter[id^="avk-c2d-"]')) el.remove();
  });
}

// ─── Renderer fallback tests ────────────────────────────────────────────────

describe('createRenderer — Canvas2D fallback when WebGL unavailable', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    isSafariValue = false;
    blockWebGL();
  });

  afterEach(() => {
    restoreWebGL();
    canvas?.remove();
    cleanupSvgFilters();
  });

  it('should create a renderer via Canvas2D fallback on non-Safari', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas });
    expect(renderer).toBeDefined();
    expect(renderer.isDestroyed).toBe(false);
    renderer.destroy();
  });

  it('should insert an SVG filter element into the document', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas });

    const filter = document.querySelector('filter[id^="avk-c2d-"]');
    expect(filter).toBeTruthy();
    expect(filter!.querySelector('feOffset')).toBeTruthy();
    expect(filter!.querySelector('feColorMatrix')).toBeTruthy();
    expect(filter!.querySelector('feComposite')).toBeTruthy();

    renderer.destroy();
  });

  it('should remove SVG filter after last renderer is destroyed', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas });
    renderer.destroy();

    const filter = document.querySelector('filter[id^="avk-c2d-"]');
    expect(filter).toBeFalsy();
  });

  it('should share the SVG filter across multiple renderers', () => {
    canvas = document.createElement('canvas');
    const canvas2 = document.createElement('canvas');
    document.body.appendChild(canvas);
    document.body.appendChild(canvas2);

    const r1 = createRenderer({ canvas });
    const r2 = createRenderer({ canvas: canvas2 });

    const filters = document.querySelectorAll('filter[id^="avk-c2d-"]');
    expect(filters.length).toBe(1);

    r1.destroy();
    // Filter should still exist (r2 holds a reference)
    expect(document.querySelector('filter[id^="avk-c2d-"]')).toBeTruthy();

    r2.destroy();
    // Now it should be gone
    expect(document.querySelector('filter[id^="avk-c2d-"]')).toBeFalsy();

    canvas2.remove();
  });

  it('should mark as destroyed after destroy()', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas });
    renderer.destroy();
    expect(renderer.isDestroyed).toBe(true);
  });

  it('should not throw when calling drawFrame after destroy', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas });
    renderer.destroy();

    const video = document.createElement('video');
    expect(() => renderer.drawFrame(video)).not.toThrow();
  });

  it('should not throw when calling setPremultipliedAlpha', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    const renderer = createRenderer({ canvas });
    expect(() => renderer.setPremultipliedAlpha(true)).not.toThrow();
    expect(() => renderer.setPremultipliedAlpha(false)).not.toThrow();
    renderer.destroy();
  });
});

// ─── macOS: no fallback ─────────────────────────────────────────────────────

describe('createRenderer — should throw in Safari when WebGL unavailable', () => {
  let canvas: HTMLCanvasElement;

  beforeEach(() => {
    isSafariValue = true;
    blockWebGL();
  });

  afterEach(() => {
    restoreWebGL();
    isSafariValue = false;
    canvas?.remove();
    cleanupSvgFilters();
  });

  it('should throw when WebGL fails in Safari', () => {
    canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    expect(() => createRenderer({ canvas })).toThrow('WebGL not supported');
  });
});

// ─── Component fallback tests ───────────────────────────────────────────────

describe('AlphaVideoKitGL component — Canvas2D fallback', () => {
  let element: AlphaVideoKitGL;

  beforeEach(() => {
    isSafariValue = false;
    blockWebGL();
  });

  afterEach(() => {
    restoreWebGL();
    element?.remove();
    cleanupSvgFilters();
  });

  it('should connect without errors when WebGL is unavailable', () => {
    element = new AlphaVideoKitGL();
    document.body.appendChild(element);
    expect(element.isConnected).toBe(true);
  });

  it('should insert SVG filter when falling back to Canvas2D', () => {
    element = new AlphaVideoKitGL();
    document.body.appendChild(element);

    const filter = document.querySelector('filter[id^="avk-c2d-"]');
    expect(filter).toBeTruthy();
  });

  it('should clean up SVG filter on disconnect', () => {
    element = new AlphaVideoKitGL();
    document.body.appendChild(element);
    element.remove();

    const filter = document.querySelector('filter[id^="avk-c2d-"]');
    expect(filter).toBeFalsy();
  });

  it('should still proxy video properties', () => {
    element = new AlphaVideoKitGL();
    document.body.appendChild(element);

    expect(element.paused).toBe(true);
    expect(element.currentTime).toBe(0);
    expect(element.volume).toBe(1);
    expect(element.muted).toBe(false);
  });

  it('should disconnect without errors', () => {
    element = new AlphaVideoKitGL();
    document.body.appendChild(element);
    element.remove();
    expect(element.isConnected).toBe(false);
  });
});

// ─── Component in Safari: no fallback ────────────────────────────────────────

describe('AlphaVideoKitGL component — Safari, no fallback', () => {
  let element: AlphaVideoKitGL;

  beforeEach(() => {
    isSafariValue = true;
    blockWebGL();
  });

  afterEach(() => {
    restoreWebGL();
    isSafariValue = false;
    element?.remove();
    cleanupSvgFilters();
  });

  it('should connect without throwing (degrades gracefully)', () => {
    element = new AlphaVideoKitGL();
    expect(() => document.body.appendChild(element)).not.toThrow();
    expect(element.isConnected).toBe(true);
  });

  it('should not create SVG filter in Safari', () => {
    element = new AlphaVideoKitGL();
    document.body.appendChild(element);

    const filter = document.querySelector('filter[id^="avk-c2d-"]');
    expect(filter).toBeFalsy();
  });
});
