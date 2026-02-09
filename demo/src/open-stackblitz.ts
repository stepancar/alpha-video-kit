const BASE = 'https://stackblitz.com/github/stepancar/alpha-video-kit/tree/main/examples';

export function openStackblitz(exampleDir: string, openFile: string = 'main.ts') {
  window.open(`${BASE}/${exampleDir}?file=${openFile}`, '_blank');
}
