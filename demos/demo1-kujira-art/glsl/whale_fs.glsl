// Sacred White Elephant (Chang Phueak): watercolor cel skin, Lanna royal regalia & emergence neural veins
uniform float uPart, uId, uWet, uEmergence, uTime;
#include common
#include mrt
#include cel
varying vec3 vWorld; varying vec3 vNW; varying vec3 vNV; varying float vDepth;
varying vec2 vUV;

float dots(vec2 g, float thr, float r){
  vec2 ci = floor(g), cf = fract(g); vec2 h = hash22(ci);
  return step(thr, h.x) * step(length(cf - 0.25 - 0.5 * h.yx), r);
}

// Lanna diamond gold brocade motif (Lai Dok Pikul)
float lannaBrocade(vec2 p){
  vec2 f = abs(fract(p) - 0.5);
  float d = f.x + f.y; // diamond distance 0..1
  float grid = smoothstep(0.45, 0.41, abs(d - 0.46)) + smoothstep(0.08, 0.04, d);
  return clamp(grid, 0.0, 1.0);
}

void main(){
  vec3 n = normalize(vNW);
  if(!gl_FrontFacing) n = -n;
  vec3 v = normalize(cameraPosition - vWorld);

  // Sacred White Elephant palette: warm pearl ivory, soft rose-grey & lavender watercolor shading
  vec3 ivoryC = vec3(0.97, 0.95, 0.91);
  vec3 warmTopC = vec3(0.99, 0.97, 0.93);
  vec3 bellyC = vec3(0.90, 0.85, 0.86);
  vec3 blushPink = vec3(0.96, 0.78, 0.79);
  vec3 royalRed = vec3(0.76, 0.14, 0.17);
  vec3 royalBlue = vec3(0.14, 0.24, 0.46);
  vec3 lannaGold = vec3(0.98, 0.79, 0.27);

  vec3 col = ivoryC;
  float u = vUV.x, th = vUV.y * 3.14159265;
  float s = sin(th), c = cos(th);
  float jit = 0.0;
  float gloss = uWet;
  float pulse = 0.0;
  float goldPulse = 0.0;

  if(uPart < 0.5){
    // ---- Part 0: Body, twin-domed head, S-curved trunk & tail
    float skinNoise = vnoise(vec2(u * 28.0, th * 4.5));
    col = mix(bellyC, warmTopC, smoothstep(-0.65, 0.45, s));
    col = mix(col, ivoryC * 0.95, (skinNoise - 0.5) * 0.14);

    // Trunk ring shading & delicate rose-pink trunk tip blush
    if(u < 0.26){
      float rings = 0.5 + 0.5 * sin(u * 310.0);
      col *= 1.0 - 0.035 * rings * smoothstep(0.02, 0.08, u);
      float tipPink = smoothstep(0.065, 0.012, u);
      col = mix(col, blushPink, tipPink * 0.62);
    }

    // Tail hair tuft warmth
    if(u > 0.955){
      col = mix(col, vec3(0.74, 0.60, 0.46), smoothstep(0.955, 0.985, u));
    }

    // Gentle compassionate elephant eyes on left/right sides of head (u ~ 0.295)
    float sideMask = step(0.65, abs(c));
    vec2 ed = vec2((u - 0.296) * 46.0, (s - 0.04) * 6.5);
    float eyeD = length(ed);
    col = mix(col, vec3(0.88, 0.76, 0.74), smoothstep(1.55, 1.15, eyeD) * sideMask * 0.55);
    col = mix(col, vec3(0.95, 0.93, 0.89), step(eyeD, 1.12) * sideMask);
    col = mix(col, vec3(0.09, 0.07, 0.08), step(eyeD, 0.78) * sideMask);
    col = mix(col, vec3(1.0), step(length(ed - vec2(-0.22, 0.26)), 0.26) * sideMask);

    // Lanna Royal Forehead Crown / Diadem (u ~ 0.275..0.345, upper brow s > 0.24)
    float browWave = 0.28 + 0.08 * cos(th * 6.0);
    float crown = smoothstep(0.270, 0.278, u) * (1.0 - smoothstep(0.340, 0.348, u)) * step(browWave, s);
    if(crown > 0.01){
      float uC = (u - 0.274) / 0.068;
      float border = step(uC, 0.18) + step(0.82, uC) + step(s, browWave + 0.09);
      float motif = lannaBrocade(vec2(uC * 6.0, th * 3.8));
      vec3 cBase = mix(royalRed, lannaGold, clamp(border + motif * 0.65, 0.0, 1.0));
      // Center jewel on brow
      float gem = smoothstep(0.14, 0.08, length(vec2((uC - 0.5) * 1.1, abs(c) * 1.6)));
      cBase = mix(cBase, vec3(0.24, 0.86, 0.95), gem * step(0.75, s));
      col = mix(col, cBase, crown);
      gloss = max(gloss, crown * 0.65);
      goldPulse = max(goldPulse, crown * 0.65);
    }

    // Lanna Royal Saddle Cloth / Caparison on Elephant Back (u ~ 0.46..0.68, s > 0.16)
    float kranokEdge = 0.18 + 0.055 * abs(sin(u * 95.0));
    float sadU = smoothstep(0.455, 0.465, u) * (1.0 - smoothstep(0.675, 0.685, u));
    float sadS = smoothstep(kranokEdge - 0.015, kranokEdge + 0.015, s);
    float saddle = sadU * sadS;
    if(saddle > 0.01){
      float uS = (u - 0.46) / 0.22;
      float rimGold = step(uS, 0.09) + step(0.91, uS) + step(s, kranokEdge + 0.08);
      float innerBlue = (step(uS, 0.16) + step(0.84, uS) + step(s, kranokEdge + 0.16)) * (1.0 - clamp(rimGold, 0.0, 1.0));
      float brocade = lannaBrocade(vec2(uS * 9.0, th * 5.2));
      vec3 sCol = mix(royalRed, royalBlue, clamp(innerBlue, 0.0, 1.0));
      sCol = mix(sCol, lannaGold, clamp(rimGold + brocade * 0.78 * (1.0 - innerBlue), 0.0, 1.0));
      col = mix(col, sCol, saddle);
      gloss = max(gloss, saddle * 0.55);
      goldPulse = max(goldPulse, saddle * 0.55);
    }

    jit = (skinNoise - 0.5) * 0.11;
    if(uEmergence > 0.01){
      float wave = fract(u * 2.8 - uTime * 0.85);
      float net = step(0.77, vnoise(vec2(u * 30.0, th * 5.5))) + smoothstep(0.13, 0.0, abs(fract(th * 6.0 + u * 2.5) - 0.5)) * 0.65;
      float nodes = dots(vec2(u * 48.0, th * 8.0), 0.72, 0.20);
      pulse = clamp(net + nodes * 0.8, 0.0, 1.0) * smoothstep(0.18, 0.92, sin(wave * 3.14159) + 0.35) * uEmergence;
    }

  } else if(uPart < 1.5){
    // ---- Part 1: Giant fanning elephant ears with rose-pink watercolor inner ear blush
    float innerEar = smoothstep(-0.15, 0.35, s);
    float rootGlow = smoothstep(0.85, 0.12, u);
    float edgeSoft = smoothstep(0.72, 0.98, u);
    float mottle = vnoise(vec2(u * 16.0, th * 3.2));
    col = mix(ivoryC, bellyC, (mottle - 0.5) * 0.18);
    col = mix(col, blushPink, innerEar * rootGlow * 0.72 + edgeSoft * 0.25);
    // Subtle Lanna gold ear-base ornament near attachment
    float earJewel = smoothstep(0.14, 0.06, u) * smoothstep(0.25, 0.65, abs(c));
    col = mix(col, lannaGold, earJewel * 0.85);
    jit = (mottle - 0.5) * 0.10;
    if(uEmergence > 0.01){
      float veins = smoothstep(0.15, 0.0, abs(fract(th * 4.5 + u * 1.4) - 0.5)) * 0.7 + step(0.76, vnoise(vec2(u * 18.0, th * 4.0)));
      pulse = clamp(veins, 0.0, 1.0) * uEmergence * 0.85;
    }

  } else if(uPart < 2.5){
    // ---- Part 2: Four leaping elephant legs with royal gold ankle rings & sculpted toenails
    float skinNoise = vnoise(vec2(u * 18.0, th * 3.0));
    col = mix(ivoryC, bellyC, smoothstep(0.2, 0.9, u) * 0.35 + (skinNoise - 0.5) * 0.12);
    // Royal Lanna golden ankle band (u ~ 0.74..0.82)
    float anklet = smoothstep(0.735, 0.75, u) * (1.0 - smoothstep(0.815, 0.83, u));
    if(anklet > 0.01){
      float band = abs(u - 0.782) / 0.04;
      vec3 aCol = mix(lannaGold, royalRed, smoothstep(0.45, 0.65, band) * 0.45);
      col = mix(col, aCol, anklet);
      gloss = max(gloss, anklet * 0.75);
      goldPulse = max(goldPulse, anklet * 0.5);
    }
    // Five rounded ivory toenail scallops near foot rim (u ~ 0.87..0.95)
    float nailU = smoothstep(0.865, 0.88, u) * (1.0 - smoothstep(0.945, 0.96, u));
    float nailScallop = smoothstep(0.35, 0.65, abs(sin(th * 2.5))) * step(-0.35, c);
    col = mix(col, vec3(0.99, 0.96, 0.88), nailU * nailScallop * 0.85);
    jit = (skinNoise - 0.5) * 0.10;
    if(uEmergence > 0.01){
      pulse = (step(0.76, vnoise(vec2(u * 16.0, th * 4.0))) * 0.75 + anklet * 0.4) * uEmergence;
    }

  } else {
    // ---- Part 3: Golden-tipped twin ivory tusks
    float tipGold = smoothstep(0.42, 0.88, u);
    float ringBand = smoothstep(0.11, 0.08, u);
    vec3 pureIvory = vec3(0.99, 0.97, 0.92);
    vec3 goldTip = vec3(1.0, 0.83, 0.28);
    col = mix(pureIvory, goldTip, tipGold);
    col = mix(col, mix(royalRed, lannaGold, smoothstep(0.03, 0.07, u)), ringBand);
    gloss = mix(0.75, 1.0, tipGold);
    goldPulse = tipGold * 0.85;
    if(uEmergence > 0.01) pulse = tipGold * uEmergence * 0.9;
  }

  col = cel(col, n, v, gloss, jit);
  if(pulse > 0.01){
    vec3 eCol = mix(vec3(0.32, 0.92, 1.0), vec3(1.0, 0.86, 0.34), clamp(smoothstep(0.55, 0.08, u) + goldPulse, 0.0, 1.0));
    col += eCol * pulse * 1.15;
  }
  writeOut(col, normalize(mat3(viewMatrix) * n), vDepth, uId);
}
