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
 * `<alpha-video-kit-svg>` — video wrapped in an SVG with an inline filter.
 *
 * Structure:
 *   <svg viewBox="0 0 W H/2">          ← clips to top half
 *     <filter>                          ← feOffset + feColorMatrix + feComposite
 *     <foreignObject W×H filter>        ← full-height video with filter applied
 *       <video>
 *
 * No canvas, no render loop. The browser composites the stacked-alpha halves
 * via the SVG filter pipeline on every paint.
 */
export class AlphaVideoKitSVG extends HTMLElement {
  static observedAttributes = [...VIDEO_ATTRS];

  #video!: HTMLVideoElement;
  #svg!: SVGSVGElement;
  #fo!: SVGForeignObjectElement;
  #filter!: SVGFilterElement;
  #feOffset!: SVGFEOffsetElement;
  #childObs: MutationObserver | null = null;
  #filterId: string;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    this.#filterId = `avk-${Math.random().toString(36).slice(2, 8)}`;

    shadow.innerHTML = `<style>
:host{display:inline-block;overflow:hidden}
svg{display:block;width:100%;height:auto}
video{display:block;width:100%;height:100%}
</style>
<svg viewBox="0 0 1 1" preserveAspectRatio="xMidYMid meet">
<defs>
<filter id="${this.#filterId}" filterUnits="userSpaceOnUse" x="0" y="0" width="1" height="1" color-interpolation-filters="sRGB">
<feOffset in="SourceGraphic" dy="0" result="s"/>
<feColorMatrix in="s" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0" result="a"/>
<feComposite in="SourceGraphic" in2="a" operator="in"/>
</filter>
</defs>
<foreignObject width="1" height="1" filter="url(#${this.#filterId})">
<video></video>
</foreignObject>
</svg>`;

    this.#svg = shadow.querySelector('svg')!;
    this.#fo = shadow.querySelector('foreignObject')!;
    this.#filter = shadow.querySelector('filter')!;
    this.#feOffset = shadow.querySelector('feOffset')!;
    this.#video = shadow.querySelector('video')!;

    for (const evt of MEDIA_EVENTS) {
      this.#video.addEventListener(evt, (e) => {
        this.dispatchEvent(new Event(e.type, { bubbles: false, cancelable: false }));
      });
    }

    this.#video.addEventListener('loadedmetadata', () => this.#updateSvgDimensions());
    this.#video.addEventListener('resize', () => this.#updateSvgDimensions());
  }

  #updateSvgDimensions() {
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
  }

  disconnectedCallback() {
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
