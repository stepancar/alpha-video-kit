import '@alpha-video-kit/webgl/register';
import type { AlphaVideoKitGL } from '@alpha-video-kit/webgl';

const SAMPLE_VIDEO_URL = 'https://stepancar.github.io/alpha-video-kit/sample-stacked.mp4';

const video = document.getElementById('video') as HTMLVideoElement;
const player = document.getElementById('player') as AlphaVideoKitGL;

video.src = SAMPLE_VIDEO_URL;
video.crossOrigin = 'anonymous';

player.src = SAMPLE_VIDEO_URL;
player.crossOrigin = 'anonymous';
