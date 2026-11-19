// generic cel material for props, lighthouse, helmsman, sail and glowing beacons
uniform vec3 uColor, uGlow; uniform float uId, uGloss, uMode, uGlowAmt;
#include common
#include mrt
#include cel
varying vec3 vWorld; varying vec3 vNW; varying vec3 vNV; varying float vDepth;
varying vec3 vLocal;
void main(){
  vec3 n = normalize(vNW);
  if(!gl_FrontFacing) n = -n;
  vec3 v = normalize(cameraPosition - vWorld);
  vec3 base = uColor;
  if(uMode > 2.5){
    // lighthouse tower stripes (red/white bands)
    float stripe = step(0.5, fract(vLocal.y * 0.22));
    base = mix(vec3(0.95, 0.94, 0.90), vec3(0.84, 0.24, 0.22), stripe);
    vec3 col = cel(base, n, v, uGloss, 0.0) + uGlow * uGlowAmt;
    writeOut(col, normalize(mat3(viewMatrix) * n), vDepth, uId);
    return;
  }
  if(uMode > 1.5){
    vec3 g = mix(uColor, vec3(0.50, 0.68, 0.86), smoothstep(-0.25, 0.35, vLocal.y));
    float band = vLocal.y * 1.5 + vLocal.z * 1.1 + vLocal.x * 1.1;
    g = mix(g, vec3(0.93, 0.97, 1.0), step(abs(band - 0.08), 0.05) * 0.8);
    writeOut(g + uGlow * uGlowAmt, normalize(mat3(viewMatrix) * n), vDepth, uId);
    return;
  }
  if(uMode > 0.5){
    float ndl = dot(n, uKey);
    base = mix(vec3(0.70, 0.86, 0.94), vec3(1.0, 0.995, 0.97), smoothstep(-0.2, -0.12, ndl));
    writeOut(mix(base * vec3(0.86, 0.92, 1.0), base, step(-0.1, ndl)), normalize(mat3(viewMatrix) * n), vDepth, uId);
    return;
  }
  vec3 outC = cel(base, n, v, uGloss, 0.0) + uGlow * uGlowAmt;
  writeOut(outC, normalize(mat3(viewMatrix) * n), vDepth, uId);
}
