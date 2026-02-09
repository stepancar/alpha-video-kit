import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export async function initFFmpeg(onProgress?: (ratio: number) => void): Promise<void> {
  if (ffmpeg?.loaded) return;
  ffmpeg = new FFmpeg();

  if (onProgress) {
    ffmpeg.on('progress', ({ progress }) => onProgress(progress));
  }

  const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
  });
}

export async function convertToStackedAlpha(inputFile: File): Promise<Blob> {
  if (!ffmpeg) throw new Error('FFmpeg not initialized');

  const ext = inputFile.name.split('.').pop() ?? 'mp4';
  const inputName = `input.${ext}`;
  const outputName = 'output.mp4';

  await ffmpeg.writeFile(inputName, await fetchFile(inputFile));

  const filterComplex = [
    '[0:v]format=rgba,split=2[top][alpha]',
    '[top]format=rgb24[top_rgb]',
    '[alpha]alphaextract,format=gray[alpha_gray]',
    '[top_rgb][alpha_gray]vstack=inputs=2',
  ].join(';');

  await ffmpeg.exec([
    '-i', inputName,
    '-filter_complex', filterComplex,
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-an',
    outputName,
  ]);

  const data = await ffmpeg.readFile(outputName);
  return new Blob([data], { type: 'video/mp4' });
}
