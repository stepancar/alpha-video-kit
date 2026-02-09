import type React from 'react';
import type { AlphaVideoKitGL } from './dist/index.js';

interface AlphaVideoKitGLAttributes extends React.VideoHTMLAttributes<AlphaVideoKitGL> {
  ref?: React.Ref<AlphaVideoKitGL>;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'alpha-video-kit-gl': AlphaVideoKitGLAttributes;
    }
  }
}
