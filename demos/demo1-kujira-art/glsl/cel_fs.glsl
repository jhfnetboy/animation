// generic cel material for Lanna Doi Suthep Chedi, hills, brocade sails, boat & glowing orbs
uniform vec3 uColor, uGlow; uniform float uId, uGloss, uMode, uGlowAmt;
#include common
#include mrt
#include cel
varying vec3 vWorld; varying vec3 vNW; varying vec3 vNV; varying float vDepth;
varying vec3 vLocal;

float lannaDiamond(vec2 p){
  vec2 f = abs(fract(p) - 0.5);
  float d = f.x + f.y;
  float edge = smoothstep(0.47, 0.43, abs(d - 0.46));
  float core = smoothstep(0.14, 0.08, d);
  return clamp(edge * 0.85 + core, 0.0, 1.0);
}

void main(){
  vec3 n = normalize(vNW);
  if(!gl_FrontFacing) n = -n;
  vec3 v = normalize(cameraPosition - vWorld);
  vec3 base = uColor;

  if(uMode > 4.5){
    // Doi Suthep lush northern Thai mountain canopy gradient & dappled foliage
    float canopy = vnoise(vWorld.xz * 0.14) * 0.65 + vnoise(vWorld.xz * 0.42 + 4.1) * 0.35;
    float mist = smoothstep(0.0, 9.5, vWorld.y);
    vec3 deepCanopy = uColor * vec3(0.76, 0.84, 0.88);
    vec3 sunlitCanopy = mix(uColor, vec3(0.42, 0.68, 0.44), 0.45);
    base = mix(deepCanopy, sunlitCanopy, clamp(mist * 0.6 + canopy * 0.55, 0.0, 1.0));
    float jit = (canopy - 0.5) * 0.14;
    vec3 col = cel(base, n, v, uGloss, jit) + uGlow * uGlowAmt;
    writeOut(col, normalize(mat3(viewMatrix) * n), vDepth, uId);
    return;
  }

  if(uMode > 3.5){
    // Lanna Diamond Gold Brocade (silk sails & temple ornamental bands)
    vec2 p = vec2(vLocal.z * 1.6 + vLocal.y * 1.4, vLocal.z * 1.6 - vLocal.y * 1.4);
    float pat = lannaDiamond(p);
    float trim = smoothstep(0.06, 0.02, abs(fract(vLocal.y * 0.45) - 0.5));
    vec3 goldSilk = vec3(0.96, 0.78, 0.28);
    vec3 crimsonSilk = mix(uColor, vec3(0.74, 0.16, 0.18), 0.38);
    base = mix(uColor, crimsonSilk, trim * 0.65);
    base = mix(base, goldSilk, clamp(pat * 0.75 + trim * 0.45, 0.0, 1.0));
    vec3 col = cel(base, n, v, max(uGloss, 0.25), (vnoise(vLocal.yz * 5.0) - 0.5) * 0.06) + uGlow * uGlowAmt;
    writeOut(col, normalize(mat3(viewMatrix) * n), vDepth, uId);
    return;
  }

  if(uMode > 2.5){
    // Lanna white & gold Chedi stepped base / sacred tower molding bands
    float band = smoothstep(0.14, 0.06, abs(fract(vLocal.y * 1.25 + 0.25) - 0.5));
    float stone = vnoise(vLocal.xz * 2.2 + vLocal.y * 1.5);
    vec3 ivoryStone = mix(uColor, vec3(0.98, 0.96, 0.90), stone * 0.35);
    base = mix(ivoryStone, vec3(0.95, 0.76, 0.25), band * 0.85);
    vec3 col = cel(base, n, v, uGloss, (stone - 0.5) * 0.05) + uGlow * uGlowAmt;
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
