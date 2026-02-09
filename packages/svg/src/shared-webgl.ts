const VERTEX_SRC = `
precision mediump float;
attribute vec2 a_position;
varying vec2 v_texCoord;

void main() {
  gl_Position = vec4(a_position * 2.0 - 1.0, 0, 1);
  v_texCoord = vec2(a_position.x, 1.0 - a_position.y);
}
`;

const FRAGMENT_SRC = `
precision mediump float;
uniform sampler2D u_frame;
varying vec2 v_texCoord;

void main() {
  vec2 colorCoord = vec2(v_texCoord.x, v_texCoord.y * 0.5);
  vec2 alphaCoord = vec2(v_texCoord.x, 0.5 + v_texCoord.y * 0.5);

  vec4 color = texture2D(u_frame, colorCoord);
  float alpha = texture2D(u_frame, alphaCoord).r;

  gl_FragColor = vec4(color.rgb * alpha, alpha);
}
`;

interface SharedGLContext {
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  texture: WebGLTexture;
  program: WebGLProgram;
  vertexShader: WebGLShader;
  fragmentShader: WebGLShader;
  buffer: WebGLBuffer;
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

  const vertexShader = compileShader(gl, VERTEX_SRC, gl.VERTEX_SHADER);
  const fragmentShader = compileShader(gl, FRAGMENT_SRC, gl.FRAGMENT_SHADER);

  const program = gl.createProgram()!;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`);
  }

  gl.useProgram(program);

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

  const texture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  shared = { canvas, gl, texture, program, vertexShader, fragmentShader, buffer, refCount: 1 };
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

  gl.bindTexture(gl.TEXTURE_2D, texture);
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

export type { SharedGLContext };
