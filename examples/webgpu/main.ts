import '@alpha-video-kit/webgpu/register';
import type { AlphaVideoKitGPU } from '@alpha-video-kit/webgpu';

const SAMPLE_VIDEO_URL = 'https://stepancar.github.io/alpha-video-kit/sample-stacked.mp4';

const video = document.getElementById('video') as HTMLVideoElement;
const player = document.getElementById('player') as AlphaVideoKitGPU;

video.src = SAMPLE_VIDEO_URL;
video.crossOrigin = 'anonymous';

player.src = SAMPLE_VIDEO_URL;
player.crossOrigin = 'anonymous';
