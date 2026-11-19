// Overlay Yi Peng Khom Loi sky lanterns, lotus starbursts & river-reflection orbs
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

  float core = 0.0;
  float wick = 0.0;
  float innerHeat = 0.0;
  float ribShade = 1.0;

  if(shape < 0.5){
    // Classic Chiang Mai Yi Peng Khom Loi: rounded tapered paper sky lantern + bottom fuel wick
    float sway = sin(uDraw * 2.4 + seed * 18.85) * 0.09;
    float cs = cos(sway), ss = sin(sway);
    vec2 pl = vec2(cs * p.x - ss * p.y, ss * p.x + cs * p.y);

    float h = clamp((pl.y + 0.36) / 0.86, 0.0, 1.0);
    float top = max(0.0, h - 0.62) / 0.38;
    float arch = sqrt(max(0.0, 1.0 - top * top));
    float taper = mix(0.18, 0.38, smoothstep(0.0, 0.65, h));
    float halfW = taper * arch;

    float dx = abs(pl.x) - halfW;
    float dy = abs(pl.y - 0.07) - 0.43;
    float sdf = max(dx, dy);
    core = 1.0 - smoothstep(-0.04, 0.055, sdf);

    // Subtle vertical paper lantern bamboo ribs
    ribShade = 0.90 + 0.10 * cos((pl.x / max(halfW, 0.04)) * 6.283);

    // Flickering warm orange-gold fuel wick at base opening
    float flicker = 0.90 + 0.16 * sin(uDraw * 14.0 + seed * 31.4);
    vec2 fp = (pl - vec2(0.0, -0.32)) * vec2(1.15, 0.85);
    wick = exp(-dot(fp, fp) * 72.0) * flicker;

    vec2 gp = (pl - vec2(0.0, -0.18)) * vec2(1.35, 1.05);
    innerHeat = exp(-dot(gp, gp) * 5.0) * core;
  } else if(shape < 1.5){
    // 8-point Lotus Starburst
    float ang = seed * 6.283 + floor(uDraw * 12.0) * 0.06;
    float ca = cos(ang), sa = sin(ang);
    vec2 pr = vec2(ca * p.x - sa * p.y, sa * p.x + ca * p.y);
    float s1 = min(abs(pr.x) * 2.45 + abs(pr.y) * 0.72, abs(pr.y) * 2.45 + abs(pr.x) * 0.72);
    vec2 pr45 = vec2(pr.x - pr.y, pr.x + pr.y) * 0.7071;
    float s2 = min(abs(pr45.x) * 2.85 + abs(pr45.y) * 0.95, abs(pr45.y) * 2.85 + abs(pr45.x) * 0.95);
    float lotus = min(s1, s2 * 1.12);
    core = 1.0 - smoothstep(0.24, 0.38, lotus);
    wick = exp(-dot(p, p) * 26.0) * 0.65;
  } else {
    // Round-bellied Yi Peng paper lantern & luminous water reflection orb
    float sway = sin(uDraw * 2.1 + seed * 15.7) * 0.08;
    float cs = cos(sway), ss = sin(sway);
    vec2 pl = vec2(cs * p.x - ss * p.y, ss * p.x + cs * p.y);

    float h = clamp((pl.y + 0.34) / 0.74, 0.0, 1.0);
    float b = (h - 0.54) / 0.46;
    float dome = sqrt(max(0.0, 1.0 - b * b));
    float halfW = (0.14 + 0.24 * dome) * mix(0.85, 1.0, h);
    float sdf = max(abs(pl.x) - halfW, abs(pl.y - 0.03) - 0.37);
    core = 1.0 - smoothstep(-0.04, 0.06, sdf);

    float flicker = 0.90 + 0.14 * sin(uDraw * 12.0 + seed * 23.1);
    vec2 fp = (pl - vec2(0.0, -0.30)) * vec2(1.1, 0.9);
    wick = exp(-dot(fp, fp) * 76.0) * flicker;
    vec2 gp = (pl - vec2(0.0, -0.14)) * vec2(1.3, 1.05);
    innerHeat = exp(-dot(gp, gp) * 5.2) * core;
  }

  float halo = exp(-r * r * 6.5) * (0.30 + boost * 0.26);
  float waterTint = (behind && sceneId < 0.5) ? 0.65 : 1.0;
  vec3 tintCol = (behind && sceneId < 0.5) ? mix(vColor, vec3(0.26, 0.88, 0.95), 0.35) : vColor;

  vec3 paperCol = tintCol * ribShade * (0.76 + boost * 0.60);
  vec3 warmGlow = vec3(1.0, 0.76, 0.34) * innerHeat * (0.58 + boost * 0.45);
  vec3 wickCol = vec3(1.0, 0.94, 0.72) * wick * (0.95 + boost * 0.55);
  vec3 col = paperCol + warmGlow + wickCol;

  float alpha = clamp((core * 0.86 + wick * 0.75 + halo * 0.44) * waterTint * uOpacity, 0.0, 0.94);
  if(alpha < 0.01) discard;
  o = vec4(col, alpha);
}
