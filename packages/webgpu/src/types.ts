export interface StackedAlphaRendererOptions {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  premultipliedAlpha?: boolean;
}

export interface StackedAlphaRenderer {
  drawFrame(video: HTMLVideoElement): void;
  setPremultipliedAlpha(value: boolean): void;
  destroy(): void;
  readonly isDestroyed: boolean;
}
