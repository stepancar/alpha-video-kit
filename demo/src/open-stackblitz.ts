import sdk from '@stackblitz/sdk';

const REPO = 'stepancar/alpha-video-kit';

export function openStackblitz(exampleDir: string, openFile: string = 'main.ts') {
  sdk.openGithubProject(REPO, {
    openFile: `examples/${exampleDir}/${openFile}`,
    newWindow: true,
  });
}
