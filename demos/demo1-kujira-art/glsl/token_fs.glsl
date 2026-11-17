// Act 1 geometric token blocks: hand-painted cel facets with subtle luminous rim
uniform float uId;
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
  vec3 c = cel(vColor, n, v, 0.75, 0.0);
  // luminous edge & boost so tokens read like crisp glowing building blocks
  float fres = pow(1.0 - max(dot(n, v), 0.0), 2.5);
  c += vColor * (0.28 + vBoost * 0.9) + vec3(1.0, 0.96, 0.88) * fres * (0.25 + vBoost * 0.5);
  writeOut(c, normalize(mat3(viewMatrix) * n), vDepth, uId);
}
