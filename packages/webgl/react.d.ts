import type { AlphaVideoKitGL } from './dist/index.js';

interface AlphaVideoKitGLAttributes extends React.HTMLAttributes<AlphaVideoKitGL> {
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
      'alpha-video-kit-gl': AlphaVideoKitGLAttributes;
    }
  }
}
