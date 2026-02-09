import { shaderSource } from './shaders.js';
import type { StackedAlphaRenderer, StackedAlphaRendererOptions } from './types.js';

let sharedDevice: GPUDevice | null = null;

async function getSharedDevice(): Promise<GPUDevice> {
  if (sharedDevice) return sharedDevice;

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) throw new Error('WebGPU: no adapter available');

  sharedDevice = await adapter.requestDevice();
  sharedDevice.lost.then(() => {
    sharedDevice = null;
  });

  return sharedDevice;
}

export async function createRenderer(
  options: StackedAlphaRendererOptions,
): Promise<StackedAlphaRenderer> {
  const { canvas, premultipliedAlpha = false } = options;

  const device = await getSharedDevice();

  const context = canvas.getContext('webgpu') as GPUCanvasContext;
  if (!context) throw new Error('WebGPU canvas context not available');

  const format = navigator.gpu.getPreferredCanvasFormat();
  context.configure({
    device,
    format,
    alphaMode: 'premultiplied',
  });

  const shaderModule = device.createShaderModule({ code: shaderSource });

  const pipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: shaderModule,
      entryPoint: 'vs',
    },
    fragment: {
      module: shaderModule,
      entryPoint: 'fs',
      targets: [
        {
          format,
          blend: {
            color: { srcFactor: 'src-alpha', dstFactor: 'one-minus-src-alpha' },
            alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' },
          },
        },
      ],
    },
    primitive: { topology: 'triangle-list' },
  });

  const sampler = device.createSampler({
    magFilter: 'linear',
    minFilter: 'linear',
  });

  const uniformBuffer = device.createBuffer({
    size: 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(
    uniformBuffer,
    0,
    new Float32Array([premultipliedAlpha ? 1.0 : 0.0]),
  );

  let destroyed = false;

  return {
    drawFrame(video: HTMLVideoElement) {
      if (destroyed) return;

      const width = video.videoWidth;
      const height = Math.floor(video.videoHeight / 2);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        context.configure({ device, format, alphaMode: 'premultiplied' });
      }

      const externalTexture = device.importExternalTexture({ source: video });

      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [
          { binding: 0, resource: sampler },
          { binding: 1, resource: externalTexture },
          { binding: 2, resource: { buffer: uniformBuffer } },
        ],
      });

      const commandEncoder = device.createCommandEncoder();
      const textureView = context.getCurrentTexture().createView();

      const renderPass = commandEncoder.beginRenderPass({
        colorAttachments: [
          {
            view: textureView,
            clearValue: { r: 0, g: 0, b: 0, a: 0 },
            loadOp: 'clear',
            storeOp: 'store',
          },
        ],
      });

      renderPass.setPipeline(pipeline);
      renderPass.setBindGroup(0, bindGroup);
      renderPass.draw(6);
      renderPass.end();

      device.queue.submit([commandEncoder.finish()]);
    },

    setPremultipliedAlpha(value: boolean) {
      if (destroyed) return;
      device.queue.writeBuffer(uniformBuffer, 0, new Float32Array([value ? 1.0 : 0.0]));
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      uniformBuffer.destroy();
    },

    get isDestroyed() {
      return destroyed;
    },
  };
}
