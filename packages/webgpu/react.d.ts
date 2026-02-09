import type { AlphaVideoKitGPU } from './dist/index.js';

interface AlphaVideoKitGPUAttributes extends React.HTMLAttributes<AlphaVideoKitGPU> {
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

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'alpha-video-kit-gpu': AlphaVideoKitGPUAttributes;
    }
  }
}
