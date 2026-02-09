import { vertexShaderSource, fragmentShaderSource } from './shaders.js';
import type { StackedAlphaRenderer, StackedAlphaRendererOptions } from './types.js';

function compileShader(
  gl: WebGLRenderingContext,
  source: string,
  type: number,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Failed to create shader');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed: ${info}`);
  }
  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error('Failed to create program');
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program linking failed: ${info}`);
  }
  return program;
}

export function createRenderer(options: StackedAlphaRendererOptions): StackedAlphaRenderer {
  const { canvas, premultipliedAlpha = false } = options;

  const contextOptions: WebGLContextAttributes = {
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
    powerPreference: 'low-power',
  };

  const gl =
    (canvas.getContext('webgl2', contextOptions) as WebGLRenderingContext | null) ??
    (canvas.getContext('webgl', contextOptions) as WebGLRenderingContext | null);

  if (!gl) throw new Error('WebGL not supported');

  const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  const program = createProgram(gl, vertexShader, fragmentShader);

  gl.useProgram(program);

  // Geometry: unit quad
  const positionLocation = gl.getAttribLocation(program, 'a_position');
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(positionLocation);
  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  // Matrix uniform: maps unit quad to clip space
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
  // prettier-ignore
  gl.uniformMatrix3fv(matrixLocation, false, [
    2, 0, 0,
    0, -2, 0,
    -1, 1, 1,
  ]);

  // Texture
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Premultiplied alpha uniform
  const premultipliedAlphaLocation = gl.getUniformLocation(program, 'u_premultipliedAlpha');
  gl.uniform1f(premultipliedAlphaLocation, premultipliedAlpha ? 1.0 : 0.0);

  let destroyed = false;

  return {
    drawFrame(video: HTMLVideoElement) {
      if (destroyed) return;

      const width = video.videoWidth;
      const height = Math.floor(video.videoHeight / 2);

      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }

      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    },

    setPremultipliedAlpha(value: boolean) {
      if (destroyed) return;
      gl.uniform1f(premultipliedAlphaLocation, value ? 1.0 : 0.0);
    },

    destroy() {
      if (destroyed) return;
      destroyed = true;
      gl.deleteTexture(texture);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    },

    get isDestroyed() {
      return destroyed;
    },
  };
}
