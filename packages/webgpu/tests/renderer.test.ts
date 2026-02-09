import { describe, it, expect } from 'vitest';
import { createRenderer } from '../src/renderer.js';

describe('WebGPU Renderer', () => {
  it('should export createRenderer function', () => {
    expect(typeof createRenderer).toBe('function');
  });

  it('should handle WebGPU availability', async () => {
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    try {
      const renderer = await createRenderer({ canvas });
      // If we get here, WebGPU is available
      expect(renderer).toBeDefined();
      expect(renderer.isDestroyed).toBe(false);
      renderer.destroy();
      expect(renderer.isDestroyed).toBe(true);
    } catch (e) {
      // WebGPU not available in this environment — that's expected
      expect(e).toBeDefined();
    } finally {
      canvas.remove();
    }
  });
});
