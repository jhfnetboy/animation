uniform float uId, uGlowAmt;
uniform vec3 uGlow;
#include common
#include mrt
#include cel
varying vec3 vWorld; varying vec3 vNW; varying vec3 vNV; varying float vDepth;
varying vec2 vHull; varying vec3 vLocal;
void main(){
  vec3 n = normalize(vNW);
  if(!gl_FrontFacing) n = -n;
  vec3 v = normalize(cameraPosition - vWorld);
  float y = vLocal.y, s = vHull.y;
  vec3 base;
  float gloss = 0.55;

  if(vHull.x < 0.5){
    // Thai hand-painted teak wood hull + emerald waterline + gold/vermilion Lanna trim
    float g1 = vnoise(vec2(vLocal.x * 2.2, s * 14.0 + vnoise(vec2(vLocal.x * 0.55, s * 3.0)) * 1.4));
    float g2 = vnoise(vec2(vLocal.x * 10.5, s * 28.0));
    vec3 teakDark = vec3(0.35, 0.17, 0.08);
    vec3 teakWarm = vec3(0.58, 0.31, 0.14);
    base = mix(teakDark, teakWarm, clamp(0.32 + 0.48 * g1 + 0.22 * g2, 0.0, 1.0));
    float plank = smoothstep(0.42, 0.49, abs(fract(s * 7.5 + 0.18) - 0.5));
    base *= 1.0 - plank * 0.22;

    // Emerald waterline & crisp ivory dividing stripe
    float wl = smoothstep(0.30, 0.24, y);
    vec3 emerald = mix(vec3(0.08, 0.38, 0.30), vec3(0.12, 0.48, 0.38), g1);
    base = mix(base, emerald, wl);
    float wlEdge = (1.0 - smoothstep(0.02, 0.055, abs(y - 0.29))) * step(0.15, s);
    base = mix(base, vec3(0.95, 0.90, 0.76), wlEdge);

    // Vermilion & Gold Lanna gunwale border with diamond motif
    float trimZone = step(0.79, s) * step(s, 0.95);
    float tx = fract(vLocal.x * 1.45);
    float ts = clamp((s - 0.80) / 0.13, 0.0, 1.0);
    float diam = abs(tx - 0.5) * 2.0 + abs(ts - 0.5) * 2.0;
    float motif = step(diam, 0.66) * (1.0 - step(diam, 0.30));
    vec3 lannaBand = mix(vec3(0.75, 0.15, 0.13), vec3(0.95, 0.75, 0.25), motif * 0.9);
    base = mix(base, lannaBand, trimZone);

    float goldLine = (1.0 - smoothstep(0.012, 0.024, abs(s - 0.785)))
                   + (1.0 - smoothstep(0.012, 0.024, abs(s - 0.945)));
    base = mix(base, vec3(0.96, 0.78, 0.28), clamp(goldLine, 0.0, 1.0));
    base = mix(base, vec3(0.26, 0.10, 0.08), step(0.962, s));

    // Auspicious Thai bow paintwork & guardian boat-eye motif on fore-hull
    float bowZone = smoothstep(3.4, 4.9, vLocal.x) * step(0.34, s);
    vec3 bowGreen = vec3(0.11, 0.52, 0.40);
    vec3 bowRed = vec3(0.80, 0.18, 0.15);
    vec3 bowPaint = mix(bowGreen, bowRed, smoothstep(0.55, 0.85, s));
    base = mix(base, bowPaint, bowZone * 0.82 * (1.0 - trimZone));

    vec2 eyeD = vec2((vLocal.x - 4.85) * 0.85, (s - 0.64) * 3.6);
    float eyeR = length(eyeD);
    float goldLid = 1.0 - smoothstep(0.28, 0.35, eyeR);
    float sclera = 1.0 - smoothstep(0.20, 0.25, eyeR);
    float pupil = 1.0 - smoothstep(0.09, 0.13, eyeR);
    base = mix(base, vec3(0.96, 0.78, 0.26), goldLid * step(3.8, vLocal.x));
    base = mix(base, vec3(0.97, 0.95, 0.88), sclera * step(3.8, vLocal.x));
    base = mix(base, vec3(0.12, 0.14, 0.22), pupil * step(3.8, vLocal.x));
    gloss = mix(0.45, 0.78, wl + trimZone * 0.5);
  } else if(vHull.x < 1.5){
    // Gunwale top rail: lacquered dark vermilion teak
    base = vec3(0.44, 0.14, 0.10);
    gloss = 0.35;
  } else if(vHull.x < 2.5){
    // Inner teak deck planking
    float dGrain = vnoise(vec2(vLocal.x * 2.8, vLocal.z * 16.0));
    base = mix(vec3(0.44, 0.25, 0.13), vec3(0.56, 0.33, 0.17), dGrain);
    float seam = smoothstep(0.43, 0.495, abs(fract(vLocal.z * 3.2) - 0.5));
    base *= 1.0 - seam * 0.18;
    gloss = 0.08;
  } else {
    // Act 5 Lanna Ivory-Gold Silk Sail with crimson-gold diamond woven motif
    float u = clamp(vHull.x - 3.0, 0.0, 1.0);
    float vtx = clamp(s, 0.0, 1.0);
    float weave = vnoise(vec2(u * 48.0, vtx * 48.0)) * 0.06 + sin(u * 140.0) * sin(vtx * 140.0) * 0.015;
    base = vec3(0.97, 0.90, 0.73) - weave;

    float edge = min(min(u, 1.0 - u), min(vtx, 1.0 - vtx));
    float crimsonHem = 1.0 - step(0.055, edge);
    float goldTrim = step(0.055, edge) * (1.0 - step(0.080, edge));
    base = mix(base, vec3(0.75, 0.17, 0.14), crimsonHem);
    base = mix(base, vec3(0.94, 0.74, 0.24), goldTrim);

    // Woven horizontal Lanna diamond bands + central medallion motif
    float band = (1.0 - step(0.045, abs(vtx - 0.20))) + (1.0 - step(0.045, abs(vtx - 0.80)));
    float pat = abs(fract(u * 8.0) - 0.5) * 2.0 + abs(fract(vtx * 20.0) - 0.5) * 2.0;
    float bDiamond = step(pat, 0.85) * (1.0 - step(pat, 0.35));
    base = mix(base, mix(vec3(0.76, 0.18, 0.15), vec3(0.94, 0.74, 0.24), bDiamond), clamp(band, 0.0, 1.0) * 0.88);

    vec2 c = vec2(u - 0.5, vtx - 0.5);
    float md = abs(c.x) * 2.6 + abs(c.y) * 2.2;
    float medOuter = 1.0 - step(0.42, md);
    float medMid = 1.0 - step(0.28, md);
    float medInner = 1.0 - step(0.14, md);
    base = mix(base, vec3(0.93, 0.73, 0.24), medOuter);
    base = mix(base, vec3(0.76, 0.18, 0.15), medMid);
    base = mix(base, vec3(0.98, 0.86, 0.44), medInner);
    gloss = 0.05;
  }

  vec3 col = cel(base, n, v, gloss, 0.0) + uGlow * uGlowAmt;
  writeOut(col, normalize(mat3(viewMatrix) * n), vDepth, uId);
}
