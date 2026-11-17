// Overlay stardust nodes with crisp painted jewel shapes and gentle bloom
uniform sampler2D tData;
uniform vec2 uRes;
uniform float uDraw, uOpacity;
varying vec2 vQ;
varying vec3 vColor;
varying vec3 vMeta;
varying float vDepth;
out vec4 o;
#include common
void main(){
  if(uOpacity <= 0.01) discard;
  vec2 uv = gl_FragCoord.xy / uRes;
  vec4 d = texture(tData, uv);
  float sceneDepth = d.b;
  float sceneId = d.a;
  bool behind = vDepth > sceneDepth + 0.15;
  if(behind && sceneId > 0.5 && sceneId < 99.5) discard;

  vec2 p = vQ;
  float r = length(p);
  if(r > 1.0) discard;

  float shape = vMeta.x;
  float boost = vMeta.y;
  float seed = vMeta.z;
  float ang = seed * 6.283 + floor(uDraw * 12.0) * 0.08;
  float ca = cos(ang), sa = sin(ang);
  vec2 pr = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);

  float core = 0.0;
  if(shape < 0.5){
    float dm = abs(pr.x) + abs(pr.y);
    core = 1.0 - smoothstep(0.26, 0.36, dm);
  } else if(shape < 1.5){
    float st = min(abs(pr.x) * 2.4 + abs(pr.y) * 0.75, abs(pr.y) * 2.4 + abs(pr.x) * 0.75);
    core = 1.0 - smoothstep(0.26, 0.38, st);
  } else {
    float orb = length(p * vec2(0.85, 1.3));
    core = 1.0 - smoothstep(0.24, 0.36, orb);
  }
  float halo = exp(-r * r * 7.5) * (0.28 + boost * 0.25);
  float inkRim = (1.0 - smoothstep(0.02, 0.07, abs(r - 0.38))) * core * 0.35;

  float waterTint = (behind && sceneId < 0.5) ? 0.68 : 1.0;
  vec3 tintCol = (behind && sceneId < 0.5) ? mix(vColor, vec3(0.26, 0.88, 1.0), 0.35) : vColor;
  vec3 col = tintCol * (0.78 + boost * 0.65) + vec3(1.0, 0.96, 0.85) * core * (0.35 + boost * 0.30);
  col = mix(col, vec3(0.16, 0.30, 0.48), inkRim);

  float alpha = clamp((core * 0.88 + halo * 0.42) * waterTint * uOpacity, 0.0, 0.92);
  if(alpha < 0.01) discard;
  o = vec4(col, alpha);
}
