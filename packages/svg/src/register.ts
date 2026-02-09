import { AlphaVideoKitSVG } from './svg-component.js';
import { AlphaVideoKitCanvas } from './canvas-component.js';

if (!customElements.get('alpha-video-kit-svg')) {
  customElements.define('alpha-video-kit-svg', AlphaVideoKitSVG);
}

if (!customElements.get('alpha-video-kit-canvas')) {
  customElements.define('alpha-video-kit-canvas', AlphaVideoKitCanvas);
}
