export const fragmentShader = /* glsl */ `
uniform sampler2D tDiffuse;
uniform float contrast;
uniform float brightness;
uniform float saturation;
uniform float exposure;
varying vec2 vUv;

float applyExposure(float v, float a) {
  return v * pow(2.0, a);
}
vec3 applyExposure(vec3 v, float a) {
  return v * pow(2.0, a);
}
vec4 applyExposure(vec4 v, float a) {
  return vec4(v.rgb * pow(2.0, a), v.a);
}

vec3 brightnessContrast(vec3 color, float brightness, float contrast) {
  color = color + brightness;
  color = (color - 0.5) * contrast + 0.5;
  return clamp(color, 0.0, 1.0);
}

vec3 applySaturation(vec3 color, float saturation) {
  float luminance = dot(color, vec3(0.299, 0.587, 0.114));
  return mix(vec3(luminance), color, saturation);
}

void main() {
  vec4 tex = texture2D(tDiffuse, vUv);
  
  vec3 color = tex.rgb;
  
  color = applyExposure(color, exposure);
  color = brightnessContrast(color, brightness, contrast);
  color = applySaturation(color, saturation);
  
  gl_FragColor = vec4(color, tex.a);
}`;
