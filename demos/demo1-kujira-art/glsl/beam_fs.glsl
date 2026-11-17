// Overlay hand-painted volumetric searchlight beams & energy threads (balanced exposure, no whiteout)
uniform sampler2D tData;
uniform vec2 uRes;
uniform vec3 uColorA, uColorB;
uniform float uTime, uDraw, uOpacity, uMode; // mode 0: attention beam cone, mode 1: energy network line
varying vec4 vBeam;
varying vec3 vWorld;
varying float vDepth;
out vec4 o;
#include common
void main(){
  if(uOpacity <= 0.005) discard;
  vec2 uv = gl_FragCoord.xy / uRes;
  vec4 d = texture(tData, uv);
  float sceneDepth = d.b;
  float sceneId = d.a;
  bool behind = vDepth > sceneDepth + 0.12;
  if(behind && sceneId > 0.5 && sceneId < 99.5) discard;

  float u = vBeam.x;
  float v = vBeam.y;
  float wgt = vBeam.z;
  float ph = vBeam.w;

  // sharper core + soft feathery edges so overlapping cones preserve rich color
  float across = 1.0 - smoothstep(0.08, 1.0, abs(v));
  across = pow(across, uMode > 0.5 ? 1.5 : 2.1);

  float brush = 0.72 + 0.28 * vnoise(vec2(u * 16.0 - uDraw * 1.8, v * 6.0 + ph));
  float pulse = 0.5 + 0.5 * sin((u * 9.0 - uTime * 4.5 + ph * 6.283));
  float along = uMode > 0.5
    ? smoothstep(0.0, 0.10, u) * smoothstep(1.0, 0.90, u) * (0.55 + 0.55 * pow(pulse, 3.0))
    : smoothstep(0.0, 0.07, u) * (1.0 - smoothstep(0.55, 1.0, u)) * (0.65 + 0.25 * pulse);

  // subtle entry ripple glow where beam hits water surface (y ≈ 0)
  float surfaceFlash = uMode < 0.5 ? exp(-abs(vWorld.y) * 1.2) * 0.25 : 0.0;

  vec3 col = mix(uColorA, uColorB, clamp(u * 0.75 + pulse * 0.25, 0.0, 1.0));
  if(behind && sceneId < 0.5){
    col = mix(col, vec3(0.22, 0.85, 0.98), 0.42);
    across *= 0.65;
  }

  float baseGain = uMode < 0.5 ? 0.42 : 0.68;
  float intensity = (across * along * brush * baseGain + surfaceFlash * across * 0.5) * wgt * uOpacity;
  if(intensity < 0.004) discard;
  o = vec4(col, clamp(intensity, 0.0, 0.85));
}
