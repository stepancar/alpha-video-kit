export const vertexShaderSource = `
precision mediump float;
attribute vec2 a_position;
uniform mat3 u_matrix;
varying vec2 v_texCoord;

void main() {
  gl_Position = vec4(u_matrix * vec3(a_position, 1), 1);
  v_texCoord = a_position;
}
`;

export const fragmentShaderSource = `
precision mediump float;
uniform sampler2D u_frame;
uniform float u_premultipliedAlpha;
varying vec2 v_texCoord;

void main() {
  vec2 colorCoord = vec2(v_texCoord.x, v_texCoord.y * 0.5);
  vec2 alphaCoord = vec2(v_texCoord.x, 0.5 + v_texCoord.y * 0.5);

  vec4 color = texture2D(u_frame, colorCoord);
  float alpha = texture2D(u_frame, alphaCoord).r;

  gl_FragColor = vec4(color.rgb * mix(alpha, 1.0, u_premultipliedAlpha), alpha);
}
`;
