// Act 1 Lotus Krathong water lanterns: hand-painted cel petals, banana-leaf base & flickering candle glow
uniform float uId, uTime;
#include common
#include mrt
#include cel
varying vec3 vWorld; varying vec3 vNW; varying vec3 vNV; varying float vDepth;
varying vec3 vColor;
varying float vBoost;
void main(){
  vec3 n = normalize(vNW);
  if(!gl_FrontFacing) n = -n;
  vec3 v = normalize(cameraPosition - vWorld);

  // Subtle pandan/banana-leaf green tint on underside & lower rim, warm candle gold on upward core
  float leafMask = smoothstep(-0.15, -0.58, n.y);
  float coreMask = smoothstep(0.62, 0.92, n.y);
  vec3 base = mix(vColor, vec3(0.20, 0.64, 0.40), leafMask * 0.72);
  base = mix(base, vec3(1.0, 0.90, 0.56), coreMask * 0.55);

  vec3 c = cel(base, n, v, 0.68, 0.0);
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.3);
  float flicker = 0.88 + 0.12 * sin(uTime * 11.5 + vWorld.x * 2.1 + vWorld.z * 1.7);
  vec3 candleGlow = mix(vColor, vec3(1.0, 0.86, 0.44), 0.35 + coreMask * 0.45);
  c += candleGlow * (0.24 + vBoost * 0.85 * flicker)
     + vec3(1.0, 0.94, 0.76) * fres * (0.28 + vBoost * 0.55);

  writeOut(c, normalize(mat3(viewMatrix) * n), vDepth, uId);
}
