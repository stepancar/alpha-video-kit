import type React from 'react';
import type { AlphaVideoKitGPU } from './dist/index.js';

interface AlphaVideoKitGPUAttributes extends React.VideoHTMLAttributes<AlphaVideoKitGPU> {
  ref?: React.Ref<AlphaVideoKitGPU>;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'alpha-video-kit-gpu': AlphaVideoKitGPUAttributes;
    }
  }
}
