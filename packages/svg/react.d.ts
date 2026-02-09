import type { AlphaVideoKitSVG } from './dist/index.js';

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
  mode?: 'canvas' | 'svg-filter';
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'alpha-video-kit-svg': AlphaVideoKitSVGAttributes;
    }
  }
}
