# Alpha Video Kit

Transparent video on the web using the **stacked-alpha** technique. A monorepo of npm packages providing multiple rendering backends for playing videos with transparency.

## How it works

A "stacked-alpha" video is a standard opaque video at **double height**:
- **Top half** — RGB color data
- **Bottom half** — Alpha mask as grayscale (white = opaque, black = transparent)

A shader (or pixel manipulation) samples both halves and composites the result with proper transparency. This works with any standard video codec (H.264, AV1, VP9) — no native alpha support required.

## Packages

| Package | Renderer | Install |
|---------|----------|---------|
| `@alpha-video-kit/webgl` | WebGL / WebGL2 | `npm i @alpha-video-kit/webgl` |
| `@alpha-video-kit/webgpu` | WebGPU | `npm i @alpha-video-kit/webgpu` |
| `@alpha-video-kit/svg` | SVG filter / Canvas 2D | `npm i @alpha-video-kit/svg` |

## Quick Start

### Web Component

```html
<script type="module">
  import '@alpha-video-kit/webgl/register';
</script>

<stacked-alpha-video-gl>
  <video autoplay muted loop playsinline>
    <source src="video-stacked.mp4" type="video/mp4" />
  </video>
</stacked-alpha-video-gl>
```

### Low-level API

```typescript
import { createRenderer } from '@alpha-video-kit/webgl';

const canvas = document.querySelector('canvas');
const video = document.querySelector('video');

const renderer = createRenderer({ canvas });

function loop() {
  if (video.readyState >= 2) {
    renderer.drawFrame(video);
  }
  requestAnimationFrame(loop);
}
loop();

// Cleanup
renderer.destroy();
```

## Creating stacked-alpha videos

Using ffmpeg:

```bash
ffmpeg -i input_with_alpha.mov \
  -filter_complex "[0:v]format=rgba,split=2[top][alpha];[top]format=rgb24[top_rgb];[alpha]alphaextract,format=gray[alpha_gray];[top_rgb][alpha_gray]vstack=inputs=2" \
  -c:v libx264 -pix_fmt yuv420p -an output-stacked.mp4
```

Or use the [demo site converter](https://stepancar.github.io/alpha-video-kit/) which runs ffmpeg.wasm in the browser.

## Development

```bash
npm install
npm run build         # Build all packages
npm run test:run      # Run tests (browser mode)
npm run dev           # Start demo dev server
```

## License

MIT
