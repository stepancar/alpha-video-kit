export const shaderSource = /* wgsl */ `
struct VertexOutput {
  @builtin(position) position: vec4f,
  @location(0) texCoord: vec2f,
};

@vertex fn vs(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  let pos = array(
    vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0),
    vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0),
  );
  var output: VertexOutput;
  let xy = pos[vertexIndex];
  output.position = vec4f(xy * 2.0 - 1.0, 0.0, 1.0);
  output.position.y = -output.position.y;
  output.texCoord = xy;
  return output;
}

struct Uniforms {
  premultipliedAlpha: f32,
};

@group(0) @binding(0) var frameSampler: sampler;
@group(0) @binding(1) var frameTexture: texture_external;
@group(0) @binding(2) var<uniform> uniforms: Uniforms;

@fragment fn fs(input: VertexOutput) -> @location(0) vec4f {
  let colorCoord = vec2f(input.texCoord.x, input.texCoord.y * 0.5);
  let alphaCoord = vec2f(input.texCoord.x, 0.5 + input.texCoord.y * 0.5);

  let color = textureSampleBaseClampToEdge(frameTexture, frameSampler, colorCoord);
  let alpha = textureSampleBaseClampToEdge(frameTexture, frameSampler, alphaCoord).r;

  let premulFactor = mix(alpha, 1.0, uniforms.premultipliedAlpha);
  return vec4f(color.rgb * premulFactor, alpha);
}
`;
