import { acquire, release, processFrame, type SharedGLContext } from './shared-webgl.js';

const VIDEO_ATTRS = [
  'src', 'crossorigin', 'preload', 'autoplay', 'loop',
  'muted', 'playsinline', 'poster', 'width', 'height',
] as const;

const BOOLEAN_ATTRS = new Set(['autoplay', 'loop', 'muted', 'playsinline']);

const MEDIA_EVENTS = [
  'loadstart', 'progress', 'suspend', 'abort', 'error', 'emptied',
  'stalled', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough',
  'playing', 'waiting', 'seeking', 'seeked', 'ended', 'durationchange',
  'timeupdate', 'play', 'pause', 'ratechange', 'resize', 'volumechange',
] as const;

/**
 * `<alpha-video-kit-canvas>` — Canvas 2D output powered by a shared WebGL processor.
 *
 * A hidden <video> feeds frames through a shared WebGL canvas (singleton)
 * that composites stacked-alpha halves via a shader, then copies the result
 * to the visible <canvas> via drawImage. This avoids the 16 WebGL context
 * limit and works in Safari.
 */
export class AlphaVideoKitCanvas extends HTMLElement {
  static observedAttributes = [...VIDEO_ATTRS];

  #video!: HTMLVideoElement;
  #canvas!: HTMLCanvasElement;
  #ctx!: CanvasRenderingContext2D;
  #intersectionObs: IntersectionObserver | null = null;
  #childObs: MutationObserver | null = null;
  #isVisible = false;
  #rafId = 0;
  #vfcId = 0;

  #glCtx: SharedGLContext | null = null;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });

    shadow.innerHTML = `<style>
:host{display:inline-block;overflow:hidden}
video{position:absolute;opacity:0;pointer-events:none;width:0;height:0}
canvas{display:block;width:100%}
</style>
<video></video>
<canvas></canvas>`;

    this.#video = shadow.querySelector('video')!;
    this.#canvas = shadow.querySelector('canvas')!;
    this.#ctx = this.#canvas.getContext('2d')!;

    for (const evt of MEDIA_EVENTS) {
      this.#video.addEventListener(evt, (e) => {
        this.dispatchEvent(new Event(e.type, { bubbles: false, cancelable: false }));
      });
    }

    this.#video.addEventListener('loadedmetadata', () => this.#updateDimensions());
    this.#video.addEventListener('resize', () => this.#updateDimensions());
  }

  #updateDimensions() {
    const w = this.#video.videoWidth;
    const fullH = this.#video.videoHeight;
    if (!w || !fullH) return;
    const halfH = Math.floor(fullH / 2);

    this.#canvas.width = w;
    this.#canvas.height = halfH;
  }

  connectedCallback() {
    for (const attr of VIDEO_ATTRS) {
      if (this.hasAttribute(attr)) {
        this.#mirrorAttr(attr, this.getAttribute(attr));
      }
    }
    this.#syncSourceChildren();

    this.#childObs = new MutationObserver(() => this.#syncSourceChildren());
    this.#childObs.observe(this, { childList: true });

    this.#glCtx = acquire();

    this.#intersectionObs = new IntersectionObserver(
      ([entry]) => {
        this.#isVisible = entry.isIntersecting;
        if (this.#isVisible) {
          this.#startLoop();
        } else {
          this.#stopLoop();
        }
      },
      { threshold: 0 },
    );
    this.#intersectionObs.observe(this);
  }

  disconnectedCallback() {
    this.#stopLoop();
    this.#intersectionObs?.disconnect();
    this.#intersectionObs = null;
    this.#childObs?.disconnect();
    this.#childObs = null;
    if (this.#glCtx) {
      release(this.#glCtx);
      this.#glCtx = null;
    }
  }

  attributeChangedCallback(name: string, _old: string | null, value: string | null) {
    this.#mirrorAttr(name, value);
  }

  #mirrorAttr(name: string, value: string | null) {
    if (BOOLEAN_ATTRS.has(name)) {
      (this.#video as any)[name] = value !== null;
    } else if (value === null) {
      this.#video.removeAttribute(name);
    } else {
      this.#video.setAttribute(name, value);
    }
  }

  #syncSourceChildren() {
    this.#video.querySelectorAll('source').forEach((s) => s.remove());
    this.querySelectorAll('source').forEach((s) => {
      this.#video.appendChild(s.cloneNode(true));
    });
    if (this.#video.querySelectorAll('source').length > 0 && !this.#video.src) {
      this.#video.load();
    }
  }

  #startLoop() {
    if (!this.#isVisible) return;
    this.#stopLoop();
    if ('requestVideoFrameCallback' in this.#video) {
      const tick = () => {
        if (!this.#isVisible) return;
        this.#renderFrame();
        this.#vfcId = (this.#video as any).requestVideoFrameCallback(tick);
      };
      this.#vfcId = (this.#video as any).requestVideoFrameCallback(tick);
    } else {
      const tick = () => {
        if (!this.#isVisible) return;
        this.#renderFrame();
        this.#rafId = requestAnimationFrame(tick);
      };
      this.#rafId = requestAnimationFrame(tick);
    }
  }

  #stopLoop() {
    if (this.#vfcId) {
      (this.#video as any).cancelVideoFrameCallback?.(this.#vfcId);
      this.#vfcId = 0;
    }
    if (this.#rafId) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = 0;
    }
  }

  #renderFrame() {
    if (this.#video.readyState < 2 || !this.#glCtx) return;
    const w = this.#video.videoWidth;
    const fullH = this.#video.videoHeight;
    if (!w || !fullH) return;

    processFrame(this.#glCtx, this.#video, this.#canvas, this.#ctx);
  }

  // --- Proxied properties ---
  get src() { return this.#video.src; }
  set src(v: string) { this.setAttribute('src', v); }
  get currentSrc() { return this.#video.currentSrc; }
  get currentTime() { return this.#video.currentTime; }
  set currentTime(v: number) { this.#video.currentTime = v; }
  get duration() { return this.#video.duration; }
  get paused() { return this.#video.paused; }
  get ended() { return this.#video.ended; }
  get readyState() { return this.#video.readyState; }
  get videoWidth() { return this.#video.videoWidth; }
  get videoHeight() { return Math.floor(this.#video.videoHeight / 2); }
  get volume() { return this.#video.volume; }
  set volume(v: number) { this.#video.volume = v; }
  get playbackRate() { return this.#video.playbackRate; }
  set playbackRate(v: number) { this.#video.playbackRate = v; }
  get defaultPlaybackRate() { return this.#video.defaultPlaybackRate; }
  set defaultPlaybackRate(v: number) { this.#video.defaultPlaybackRate = v; }
  get muted() { return this.#video.muted; }
  set muted(v: boolean) { this.#video.muted = v; this.toggleAttribute('muted', v); }
  get loop() { return this.#video.loop; }
  set loop(v: boolean) { this.#video.loop = v; this.toggleAttribute('loop', v); }
  get autoplay() { return this.#video.autoplay; }
  set autoplay(v: boolean) { this.#video.autoplay = v; this.toggleAttribute('autoplay', v); }
  get preload() { return this.#video.preload; }
  set preload(v: string) { this.setAttribute('preload', v); }
  get crossOrigin() { return this.#video.crossOrigin; }
  set crossOrigin(v: string | null) { v === null ? this.removeAttribute('crossorigin') : this.setAttribute('crossorigin', v); }
  get buffered() { return this.#video.buffered; }
  get seekable() { return this.#video.seekable; }
  get played() { return this.#video.played; }
  get networkState() { return this.#video.networkState; }
  get error() { return this.#video.error; }
  get seeking() { return this.#video.seeking; }

  // --- Proxied methods ---
  play() { return this.#video.play(); }
  pause() { this.#video.pause(); }
  load() { this.#video.load(); }
  canPlayType(type: string) { return this.#video.canPlayType(type); }
}
