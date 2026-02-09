import { createRenderer } from './renderer.js';
import type { StackedAlphaRenderer } from './types.js';

export class StackedAlphaVideoGPU extends HTMLElement {
  static observedAttributes = ['premultipliedalpha'];

  #canvas: HTMLCanvasElement;
  #renderer: StackedAlphaRenderer | null = null;
  #video: HTMLVideoElement | null = null;
  #rafId: number | null = null;
  #intersectionObserver: IntersectionObserver | null = null;
  #mutationObserver: MutationObserver | null = null;
  #isVisible = false;
  #updateQueued = false;
  #initPromise: Promise<void> | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `
      <style>
        :host {
          display: inline-block;
          position: relative;
        }
        canvas {
          display: block;
          width: 100%;
          height: 100%;
        }
        ::slotted(video) {
          position: absolute;
          opacity: 0;
          pointer-events: none;
          width: 0;
          height: 0;
        }
      </style>
      <canvas></canvas>
      <slot></slot>
    `;

    this.#canvas = shadow.querySelector('canvas')!;
  }

  get premultipliedAlpha(): boolean {
    return this.hasAttribute('premultipliedalpha');
  }

  set premultipliedAlpha(value: boolean) {
    if (value) {
      this.setAttribute('premultipliedalpha', '');
    } else {
      this.removeAttribute('premultipliedalpha');
    }
  }

  attributeChangedCallback(name: string, _oldValue: string | null, _newValue: string | null) {
    if (name === 'premultipliedalpha') {
      this.#renderer?.setPremultipliedAlpha(this.premultipliedAlpha);
    }
  }

  connectedCallback() {
    this.#intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        this.#isVisible = entry.isIntersecting;
        this.#queueUpdate();
      },
      { threshold: 0 },
    );
    this.#intersectionObserver.observe(this);

    this.#mutationObserver = new MutationObserver(() => this.#queueUpdate());
    this.#mutationObserver.observe(this, { childList: true });

    this.#queueUpdate();
  }

  disconnectedCallback() {
    this.#intersectionObserver?.disconnect();
    this.#intersectionObserver = null;
    this.#mutationObserver?.disconnect();
    this.#mutationObserver = null;
    this.#detachVideo();
    this.#destroyRenderer();
  }

  #queueUpdate() {
    if (this.#updateQueued) return;
    this.#updateQueued = true;
    queueMicrotask(() => {
      this.#updateQueued = false;
      this.#update();
    });
  }

  async #update() {
    const video = this.querySelector('video');

    if (video !== this.#video) {
      this.#detachVideo();
      this.#video = video;
      if (video) {
        this.#attachVideo(video);
      }
    }

    if (this.#isVisible && this.#video) {
      await this.#ensureRenderer();
      this.#renderFrame();
      this.#startLoop();
    } else {
      this.#stopLoop();
      if (!this.#isVisible) {
        this.#destroyRenderer();
      }
    }
  }

  #attachVideo(video: HTMLVideoElement) {
    video.addEventListener('play', this.#onVideoStateChange);
    video.addEventListener('pause', this.#onVideoStateChange);
    video.addEventListener('seeked', this.#onVideoStateChange);
    video.addEventListener('loadeddata', this.#onVideoStateChange);
  }

  #detachVideo() {
    if (!this.#video) return;
    this.#video.removeEventListener('play', this.#onVideoStateChange);
    this.#video.removeEventListener('pause', this.#onVideoStateChange);
    this.#video.removeEventListener('seeked', this.#onVideoStateChange);
    this.#video.removeEventListener('loadeddata', this.#onVideoStateChange);
    this.#video = null;
    this.#stopLoop();
  }

  #onVideoStateChange = () => {
    this.#queueUpdate();
  };

  async #ensureRenderer() {
    if (this.#renderer && !this.#renderer.isDestroyed) return;
    if (this.#initPromise) return this.#initPromise;

    this.#initPromise = (async () => {
      try {
        this.#renderer = await createRenderer({
          canvas: this.#canvas,
          premultipliedAlpha: this.premultipliedAlpha,
        });
      } catch {
        // WebGPU not available
      } finally {
        this.#initPromise = null;
      }
    })();

    return this.#initPromise;
  }

  #destroyRenderer() {
    this.#renderer?.destroy();
    this.#renderer = null;
  }

  #renderFrame() {
    if (!this.#renderer || !this.#video || this.#video.readyState < 2) return;
    this.#renderer.drawFrame(this.#video);
  }

  #startLoop() {
    if (this.#rafId !== null) return;
    if (!this.#video || this.#video.paused) return;

    const loop = () => {
      this.#renderFrame();
      if (this.#video && !this.#video.paused && this.#isVisible) {
        this.#rafId = requestAnimationFrame(loop);
      } else {
        this.#rafId = null;
      }
    };

    this.#rafId = requestAnimationFrame(loop);
  }

  #stopLoop() {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
  }
}
