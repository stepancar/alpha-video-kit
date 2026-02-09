import '@alpha-video-kit/svg/register';
import type { AlphaVideoKitSVG, AlphaVideoKitCanvas } from '@alpha-video-kit/svg';

const SAMPLE_VIDEO_URL = 'https://stepancar.github.io/alpha-video-kit/sample-stacked.mp4';

const video = document.getElementById('video') as HTMLVideoElement;
const svgPlayer = document.getElementById('player-svg') as AlphaVideoKitSVG;
const canvasPlayer = document.getElementById('player-canvas') as AlphaVideoKitCanvas;

video.src = SAMPLE_VIDEO_URL;
video.crossOrigin = 'anonymous';

svgPlayer.src = SAMPLE_VIDEO_URL;
svgPlayer.crossOrigin = 'anonymous';

canvasPlayer.src = SAMPLE_VIDEO_URL;
canvasPlayer.crossOrigin = 'anonymous';
