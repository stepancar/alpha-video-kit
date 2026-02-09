import { useRef } from 'react';

import '@alpha-video-kit/webgl/register';
import '@alpha-video-kit/webgpu/register';
import '@alpha-video-kit/svg/register';

import type { AlphaVideoKitGL } from '@alpha-video-kit/webgl';

const VIDEO_URL = 'https://stepancar.github.io/alpha-video-kit/sample-stacked.mp4';

const checkerBg = 'repeating-conic-gradient(#2a2a3e 0% 25%, #1e1e30 0% 50%) 50% / 20px 20px';

export default function App() {
  const glRef = useRef<AlphaVideoKitGL>(null);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: 'system-ui, sans-serif', background: '#1a1a2e', color: '#e4e4ef',
    }}>
      <h1>React + Alpha Video Kit</h1>
      <p style={{ color: '#8888a0' }}>
        All three renderers as JSX elements with full type safety
      </p>

      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Card title="WebGL" badge="GPU">
          <alpha-video-kit-gl
            ref={glRef}
            src={VIDEO_URL}
            crossOrigin="anonymous"
            autoPlay muted loop playsInline
            style={{ width: 240, height: 240, background: checkerBg, borderRadius: 12 }}
          />
        </Card>

        <Card title="WebGPU" badge="GPU">
          <alpha-video-kit-gpu
            src={VIDEO_URL}
            crossOrigin="anonymous"
            autoPlay muted loop playsInline
            style={{ width: 240, height: 240, background: checkerBg, borderRadius: 12 }}
          />
        </Card>

        <Card title="SVG Filter" badge="CPU">
          <alpha-video-kit-svg
            src={VIDEO_URL}
            crossOrigin="anonymous"
            autoPlay muted loop playsInline
            style={{ width: 240, background: checkerBg, borderRadius: 12 }}
          />
        </Card>

        <Card title="Canvas 2D" badge="CPU">
          <alpha-video-kit-canvas
            src={VIDEO_URL}
            crossOrigin="anonymous"
            autoPlay muted loop playsInline
            style={{ width: 240, background: checkerBg, borderRadius: 12 }}
          />
        </Card>
      </div>

      <p style={{ color: '#555', fontSize: 13, marginTop: 32 }}>
        Check <code style={{ color: '#a78bfa' }}>src/alpha-video-kit.d.ts</code> to see how JSX types are enabled
      </p>
    </div>
  );
}

function Card({ title, badge, children }: {
  title: string; badge: string; children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontWeight: 600 }}>{title}</span>
        <span style={{
          fontSize: 11, padding: '2px 8px', borderRadius: 4,
          background: '#7c5cfc33', color: '#a78bfa',
        }}>{badge}</span>
      </div>
      {children}
    </div>
  );
}
