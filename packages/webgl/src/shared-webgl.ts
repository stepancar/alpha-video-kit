import { vertexShaderSource, fragmentShaderSource } from './shaders.js';

export interface SharedGLContext {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  texture: WebGLTexture;
  program: WebGLProgram;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  buffer: WebGLBuffer;
  premultipliedAlphaLocation: WebGLUniformLocation | null;
  refCount: number;
}

let shared: SharedGLContext | null = null;

function compileShader(gl: WebGLRenderingContext, src: string, type: number): WebGLShader {
  const s = gl.createShader(type);
  if (!s) throw new Error('Failed to create shader');
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(s);
    gl.deleteShader(s);
    throw new Error(`Shader compile error: ${info}`);
  }
  return s;
}

function init(): SharedGLContext {
  if (shared) {
    shared.refCount++;
    return shared;
  }

  const canvas = document.createElement('canvas');

  const glOpts: WebGLContextAttributes = {
    antialias: false,
    depth: false,
    premultipliedAlpha: true,
    powerPreference: 'low-power',
  };

  const gl =
    (canvas.getContext('webgl2', glOpts) as WebGLRenderingContext | null) ??
    (canvas.getContext('webgl', glOpts) as WebGLRenderingContext | null);

  if (!gl) throw new Error('WebGL not supported');

  const vertexShader = compileShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`);
  }

  gl.useProgram(program);

  // Geometry: unit quad
  const posLoc = gl.getAttribLocation(program, 'a_position');
  const buffer = gl.createBuffer()!;
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]),
    gl.STATIC_DRAW,
  );
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  // Matrix uniform
  const matrixLocation = gl.getUniformLocation(program, 'u_matrix');
  // prettier-ignore
  gl.uniformMatrix3fv(matrixLocation, false, [
    2, 0, 0,
    0, -2, 0,
    -1, 1, 1,
  ]);

  // Texture
  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  // Premultiplied alpha uniform
  const premultipliedAlphaLocation = gl.getUniformLocation(program, 'u_premultipliedAlpha');
  gl.uniform1f(premultipliedAlphaLocation, 0.0);

  gl.clearColor(0, 0, 0, 0);

  shared = {
    canvas, gl, texture, program, vertexShader, fragmentShader,
    buffer, premultipliedAlphaLocation, refCount: 1,
  };
  return shared;
}

/**
 * Render a stacked-alpha video frame: process via shared WebGL canvas,
 * then copy result to the destination 2D canvas.
 */
export function processFrame(
  ctx: SharedGLContext,
  video: HTMLVideoElement,
  destCanvas: HTMLCanvasElement,
  destCtx: CanvasRenderingContext2D,
  premultipliedAlpha: boolean,
): void {
  const w = video.videoWidth;
  const fullH = video.videoHeight;
  const halfH = Math.floor(fullH / 2);

  if (destCanvas.width !== w || destCanvas.height !== halfH) {
    destCanvas.width = w;
    destCanvas.height = halfH;
  }

  const { canvas, gl, texture } = ctx;

  if (canvas.width !== w || canvas.height !== halfH) {
    canvas.width = w;
    canvas.height = halfH;
    gl.viewport(0, 0, w, halfH);
  }

  // Re-bind state in case it was changed by another user of the shared context
  gl.useProgram(ctx.program);
  gl.bindBuffer(gl.ARRAY_BUFFER, ctx.buffer);
  const posLoc = gl.getAttribLocation(ctx.program, 'a_position');
  gl.enableVertexAttribArray(posLoc);
  gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

  gl.uniform1f(ctx.premultipliedAlphaLocation, premultipliedAlpha ? 1.0 : 0.0);

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  destCtx.clearRect(0, 0, w, halfH);
  destCtx.drawImage(canvas, 0, 0);
}

export function acquire(): SharedGLContext {
  return init();
}

export function release(ctx: SharedGLContext): void {
  if (ctx !== shared) return;
  ctx.refCount--;
  if (ctx.refCount <= 0) {
    const { gl, texture, buffer, program, vertexShader, fragmentShader } = ctx;
    gl.deleteTexture(texture);
    gl.deleteBuffer(buffer);
    gl.deleteProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    const ext = gl.getExtension('WEBGL_lose_context');
    if (ext) ext.loseContext();
    shared = null;
  }
}
