import sdk from '@stackblitz/sdk';

const REPO = 'stepancar/alpha-video-kit/tree/main/examples';

export function openStackblitz(exampleDir: string, openFile: string = 'main.ts') {
  sdk.openGithubProject(`${REPO}/${exampleDir}`, {
    openFile: openFile,
    newWindow: true,
  });
}
