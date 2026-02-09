import type { AlphaVideoKitSVG } from './dist/index.js';
import type { AlphaVideoKitCanvas } from './dist/index.js';

interface AlphaVideoKitSVGAttributes extends React.HTMLAttributes<AlphaVideoKitSVG> {
  src?: string;
  crossOrigin?: string;
  preload?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  poster?: string;
  width?: number | string;
  height?: number | string;
}

interface AlphaVideoKitCanvasAttributes extends React.HTMLAttributes<AlphaVideoKitCanvas> {
  src?: string;
  crossOrigin?: string;
  preload?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  poster?: string;
  width?: number | string;
  height?: number | string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'alpha-video-kit-svg': AlphaVideoKitSVGAttributes;
      'alpha-video-kit-canvas': AlphaVideoKitCanvasAttributes;
    }
  }
}
