// painted sea: turquoise near, cobalt far, inked token ripples, semantic glow, vortex & ship wake
uniform vec3 uSun, uKey;
uniform float uTime, uDraw, uDeep, uWarmth, uReveal;
uniform vec4 uFoam;
uniform vec4 uRing;
uniform vec4 uShadow;
uniform vec2 uShadowDir;
uniform vec4 uBoat;        // x z heading on
uniform vec4 uWake;        // x z heading speed
uniform vec4 uVortex;      // x z radius strength
uniform vec4 uRipples[10]; // x z radius alpha
#include common
#include mrt
varying vec3 vWorld; varying vec3 vNW; varying vec3 vNV; varying float vDepth;
void main(){
  vec3 n = normalize(vNW);
  vec3 v = normalize(cameraPosition - vWorld);
  vec2 p = vWorld.xz;
  float dist = length(p - cameraPosition.xz);
  vec3 nearC = mix(vec3(0.22, 0.74, 0.78), vec3(0.11, 0.44, 0.64), uDeep);
  vec3 midC = mix(vec3(0.10, 0.50, 0.74), vec3(0.06, 0.25, 0.52), uDeep);
  vec3 farC = mix(vec3(0.10, 0.30, 0.64), vec3(0.05, 0.14, 0.38), uDeep);
  vec3 col = mix(nearC, midC, smoothstep(8.0, 120.0, dist));
  col = mix(col, farC, smoothstep(120.0, 700.0, dist));

  // underwater translucent cosmic glow in Act 2-3
  if(uReveal > 0.01){
    float c1 = vnoise(p * 0.04 + vec2(uTime * 0.15, -uTime * 0.1));
    float c2 = vnoise(p * 0.09 - vec2(uTime * 0.2, uTime * 0.15));
    float caust = smoothstep(0.60, 0.85, c1 * 0.5 + c2 * 0.5);
    col += vec3(0.08, 0.32, 0.44) * caust * uReveal * smoothstep(220.0, 20.0, dist);
  }

  // drifting cloud shadows
  float cs = fbm2(p * 0.004 + vec2(uTime * 0.01, 0.0));
  col *= mix(1.0, 0.86, smoothstep(0.52, 0.6, cs));

  // cel swell bands
  vec2 sd = normalize(uSun.xz);
  float s = dot(n.xz, -sd) * 4.0 + (vnoise(p * 0.06 + uDraw * 0.3) - 0.5) * 0.3;
  col *= mix(0.93, 1.0, smoothstep(-0.12, 0.0, s));

  // hand-drawn wave lines
  float row = p.y * 0.11 + vnoise(p * vec2(0.05, 0.02)) * 2.2 + sin(p.x * 0.35 + floor(p.y * 0.11) * 2.1 + uDraw * 0.8) * 0.18;
  float fr = abs(fract(row) - 0.5);
  float wpx = fwidth(row) * 1.1;
  float dash = step(0.66, vnoise(vec2(p.x * 0.3 + floor(row) * 7.3, floor(row)) + uDraw * 0.15));
  float lines = (1.0 - smoothstep(wpx * 0.6, wpx * 1.3, fr)) * dash * smoothstep(500.0, 60.0, dist) * smoothstep(12.0, 30.0, dist);
  col = mix(col, mix(vec3(0.80, 0.95, 0.96), vec3(0.62, 0.85, 0.94), uDeep), lines * 0.85);
  float under = (1.0 - smoothstep(wpx * 0.5, wpx * 1.2, abs(fract(row + 0.08) - 0.5))) * dash * smoothstep(300.0, 40.0, dist);
  col = mix(col, col * 0.82, under * 0.6);

  // sky reflection toward horizon
  float fres = pow(1.0 - max(dot(n, v), 0.0), 4.0);
  vec3 refl = mix(vec3(0.62, 0.82, 0.95), vec3(0.32, 0.52, 0.76), uDeep);
  refl = mix(refl, vec3(0.98, 0.84, 0.68), uWarmth * 0.6);
  col = mix(col, refl, fres * 0.55);

  // Act 1: Token raindrop concentric watercolor + ink ripples
  for(int i = 0; i < 10; i++){
    vec4 rp = uRipples[i];
    if(rp.w > 0.01){
      float d = length(p - rp.xy);
      float jit = (vnoise(p * 0.8 + float(i) * 3.1 + uDraw * 0.4) - 0.5) * 0.55;
      float r1 = abs(d - rp.z + jit);
      float r2 = abs(d - rp.z * 0.58 + jit * 0.7);
      float ringOuter = 1.0 - smoothstep(0.18, 0.46, r1);
      float ringInner = 1.0 - smoothstep(0.12, 0.34, r2);
      float inkEdge = (1.0 - smoothstep(0.08, 0.24, abs(r1 - 0.26))) * 0.75;
      col = mix(col, vec3(0.95, 0.99, 1.0), clamp(ringOuter + ringInner * 0.75, 0.0, 1.0) * rp.w * 0.9);
      col = mix(col, vec3(0.16, 0.34, 0.54), inkEdge * rp.w * 0.85);
    }
  }

  // Act 3->4: Emergence convergence vortex on surface
  if(uVortex.w > 0.01){
    vec2 dv = p - uVortex.xy;
    float rv = length(dv);
    float ang = atan(dv.y, dv.x);
    float spiral = sin(ang * 5.0 - rv * 0.45 + uDraw * 3.2);
    float band = exp(-pow((rv - uVortex.z) / max(3.5, uVortex.z * 0.45), 2.0));
    float ringV = exp(-pow((rv - uVortex.z * 0.55) / 2.2, 2.0));
    float glow = clamp((band * (0.5 + 0.5 * spiral) + ringV * 0.85), 0.0, 1.0) * uVortex.w;
    col += mix(vec3(0.25, 0.85, 0.95), vec3(1.0, 0.84, 0.38), smoothstep(uVortex.z * 0.8, 2.0, rv)) * glow * 1.15;
  }

  // whale shadow beneath surface
  vec2 dq = p - uShadow.xy;
  vec2 ax = vec2(dot(dq, uShadowDir), dot(dq, vec2(-uShadowDir.y, uShadowDir.x)));
  float sh = length(ax / vec2(uShadow.z, uShadow.z * 0.45)) + (vnoise(p * 0.15) - 0.5) * 0.25;
  col = mix(col, vec3(0.03, 0.14, 0.34), uShadow.w * smoothstep(1.0, 0.88, sh));

  // sun glitter sparkles (on twos)
  vec3 r = reflect(-v, n);
  float sp = dot(r, uSun);
  vec2 gc = p * 0.35; vec2 gi = floor(gc), gf = fract(gc) - 0.5;
  vec2 gh = hash22(gi + floor(uDraw * 12.0));
  float star = max(1.0 - abs(gf.x) * 9.0 - abs(gf.y) * 30.0, 1.0 - abs(gf.y) * 9.0 - abs(gf.x) * 30.0);
  vec3 sparkCol = mix(vec3(1.0, 0.99, 0.92), vec3(1.0, 0.92, 0.72), uWarmth);
  col = mix(col, sparkCol, step(0.0, star) * step(0.86, gh.x) * smoothstep(0.92, 0.985, sp));

  // foam & crash ring
  float rf = length(p - uFoam.xy) / max(uFoam.z, 0.01);
  float fn = fbm2(p * 0.12 + uDraw * 0.7);
  float foam = step(rf + (fn - 0.5) * 0.9, 1.0) * uFoam.w;
  foam *= step(0.38, fbm2(p * 0.3 - uDraw * 0.5) + (1.0 - rf) * 0.4);
  float rr = length(p - uRing.xy);
  float ring = step(abs(rr - uRing.z) + (fn - 0.5) * 9.0, 6.0) * step(0.01, uRing.w);
  ring += step(rr + (fn - 0.5) * 14.0, uRing.z - 4.0) * step(0.01, uRing.w) * step(0.42, fn) * 0.85;
  float f = clamp(foam + ring, 0.0, 1.0);
  vec3 foamC = mix(vec3(0.74, 0.90, 0.94), vec3(1.0, 0.995, 0.97), step(0.0, dot(n, uKey) - 0.2 + fn * 0.3));
  col = mix(col, foamC, f);

  // boat hull water collar and Act 5 sailing wake
  if(uBoat.w > 0.5){
    vec2 dq2 = p - uBoat.xy;
    float ch = cos(uBoat.z), shd = sin(uBoat.z);
    vec2 bl = vec2(ch * dq2.x - shd * dq2.y, shd * dq2.x + ch * dq2.y);
    float bx = clamp((bl.x + 0.2) / 5.4, -1.0, 1.0);
    float hb = 1.2 * mix(0.84, 1.0, smoothstep(-1.0, -0.2, bx)) * sqrt(max(0.0, 1.0 - max(bx, 0.0) * max(bx, 0.0)));
    float out_ = max(abs(bl.y) - hb, 0.0) + max(abs(bl.x + 0.2) - 5.4, 0.0);
    float bn = vnoise(bl * vec2(1.4, 2.2) + uDraw * 3.0);
    col *= 1.0 - 0.22 * smoothstep(2.4, 0.0, out_ + bn * 0.6) * step(0.0, bl.y + 0.6);
    float collar = step(out_ + (bn - 0.5) * 0.35, 0.16) * step(0.35, vnoise(bl * vec2(2.5, 4.0) - uDraw * 2.0) + smoothstep(0.12, 0.0, out_));
    float rip = step(abs(fract(out_ * 0.55 - uDraw * 0.6) - 0.5), 0.05) * smoothstep(5.0, 1.0, out_) * step(0.45, bn) * step(0.6, out_);
    // V-shaped sailing wake behind the boat when uWake.w > 0
    float wakeFoam = 0.0;
    if(uWake.w > 0.02 && bl.x < -3.8){
      float distBack = -bl.x - 3.8;
      float spread = 1.0 + distBack * 0.32;
      float arm = abs(abs(bl.y) - spread);
      float wNoise = fbm2(bl * vec2(0.4, 0.9) + vec2(uDraw * 2.5, 0.0));
      float vArm = (1.0 - smoothstep(0.3, 1.6, arm + (wNoise - 0.5) * 1.4)) * step(0.34, wNoise);
      float centerTrail = (1.0 - smoothstep(0.4, 2.2, abs(bl.y) + (wNoise - 0.5) * 1.2)) * step(0.45, wNoise) * 0.7;
      wakeFoam = max(vArm, centerTrail) * smoothstep(55.0, 4.0, distBack) * uWake.w;
    }
    col = mix(col, foamC, clamp(collar + rip * 0.7 + wakeFoam, 0.0, 1.0));
  }

  // haze into horizon
  vec3 haze = mix(vec3(0.74, 0.86, 0.94), vec3(0.45, 0.68, 0.84), uDeep);
  haze = mix(haze, vec3(0.98, 0.86, 0.72), uWarmth * 0.75);
  col = mix(col, haze, smoothstep(400.0, 2400.0, dist));
  writeOut(col, normalize(vNV), vDepth, 0.0);
}
