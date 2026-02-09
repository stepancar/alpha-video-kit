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
 * `<alpha-video-kit-canvas>` — Canvas 2D wrapped in an SVG with an inline filter.
 *
 * Structure:
 *   <video hidden>                         ← source, not displayed
 *   <svg viewBox="0 0 W H/2">             ← clips to top half
 *     <filter>                             ← feOffset + feColorMatrix + feComposite
 *     <foreignObject W×H filter>           ← full-height canvas with filter applied
 *       <canvas>
 *
 * A hidden <video> feeds frames to <canvas> via drawImage (full stacked frame).
 * The SVG filter composites the stacked-alpha halves.
 * SVG viewBox clips to the top (color) half.
 */
export class AlphaVideoKitCanvas extends HTMLElement {
  static observedAttributes = [...VIDEO_ATTRS];

  #video!: HTMLVideoElement;
  #canvas!: HTMLCanvasElement;
  #ctx!: CanvasRenderingContext2D;
  #svg!: SVGSVGElement;
  #fo!: SVGForeignObjectElement;
  #filter!: SVGFilterElement;
  #feOffset!: SVGFEOffsetElement;
  #intersectionObs: IntersectionObserver | null = null;
  #childObs: MutationObserver | null = null;
  #isVisible = false;
  #rafId = 0;
  #vfcId = 0;
  #filterId: string;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    this.#filterId = `avk-c-${Math.random().toString(36).slice(2, 8)}`;

    shadow.innerHTML = `<style>
:host{display:inline-block;overflow:hidden}
video{position:absolute;opacity:0;pointer-events:none;width:0;height:0}
svg{display:block;width:100%;height:auto}
canvas{display:block;width:100%;height:100%}
</style>
<video></video>
<svg viewBox="0 0 1 1" preserveAspectRatio="xMidYMid meet">
<defs>
<filter id="${this.#filterId}" filterUnits="userSpaceOnUse" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">
<feOffset in="SourceGraphic" dy="0" result="s"/>
<feColorMatrix in="s" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0" result="a"/>
<feComposite in="SourceGraphic" in2="a" operator="in"/>
</filter>
</defs>
<foreignObject width="1" height="1" filter="url(#${this.#filterId})">
<canvas xmlns="http://www.w3.org/1999/xhtml"></canvas>
</foreignObject>
</svg>`;

    this.#video = shadow.querySelector('video')!;
    this.#svg = shadow.querySelector('svg')!;
    this.#fo = shadow.querySelector('foreignObject')!;
    this.#filter = shadow.querySelector('filter')!;
    this.#feOffset = shadow.querySelector('feOffset')!;
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

    this.#svg.setAttribute('viewBox', `0 0 ${w} ${halfH}`);
    this.#fo.setAttribute('width', String(w));
    this.#fo.setAttribute('height', String(fullH));
    this.#filter.setAttribute('width', String(w));
    this.#filter.setAttribute('height', String(fullH));
    this.#feOffset.setAttribute('dy', String(-halfH));

    this.#canvas.width = w;
    this.#canvas.height = fullH;
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
    if (this.#video.readyState < 2) return;
    const w = this.#video.videoWidth;
    const h = this.#video.videoHeight;
    if (!w || !h) return;
    if (this.#canvas.width !== w || this.#canvas.height !== h) {
      this.#updateDimensions();
    }
    this.#ctx.drawImage(this.#video, 0, 0);
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
