import type React from 'react';
import type { AlphaVideoKitSVG } from './dist/index.js';
import type { AlphaVideoKitCanvas } from './dist/index.js';

interface AlphaVideoKitSVGAttributes extends React.VideoHTMLAttributes<AlphaVideoKitSVG> {
  ref?: React.Ref<AlphaVideoKitSVG>;
}

interface AlphaVideoKitCanvasAttributes extends React.VideoHTMLAttributes<AlphaVideoKitCanvas> {
  ref?: React.Ref<AlphaVideoKitCanvas>;
}

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'alpha-video-kit-svg': AlphaVideoKitSVGAttributes;
      'alpha-video-kit-canvas': AlphaVideoKitCanvasAttributes;
    }
  }
}
