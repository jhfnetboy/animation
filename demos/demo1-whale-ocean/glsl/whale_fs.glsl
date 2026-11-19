// humpback cel with emergence neural luminescence veins
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
void main(){
  vec3 n = normalize(vNW);
  if(!gl_FrontFacing) n = -n;
  vec3 v = normalize(cameraPosition - vWorld);
  vec3 backC = vec3(0.23, 0.34, 0.50), flankC = vec3(0.36, 0.49, 0.64), bellyC = vec3(0.98, 0.95, 0.89);
  vec3 col;
  float u = vUV.x, th = vUV.y * 3.14159265;
  float jit = 0.0;
  float pulse = 0.0;
  if(uPart < 0.5){
    float s = sin(th), c = cos(th);
    float edge = -0.52 + 0.2 * smoothstep(0.5, 0.95, u) + (vnoise(vec2(u * 26.0, th * 3.0)) - 0.5) * 0.28;
    float belly = step(s, edge);
    col = mix(backC, flankC, smoothstep(0.75, -0.1, s));
    float sc = step(0.86, vnoise(vec2(u * 34.0, th * 3.5))) * step(0.35, s) * step(0.3, u);
    col = mix(col, vec3(0.45, 0.56, 0.70), sc * 0.7);
    col = mix(col, bellyC, belly);
    if(u < 0.5 && belly > 0.5){
      float gv = abs(fract(th * 9.0 + u * 0.8) - 0.5);
      col = mix(col, vec3(0.86, 0.72, 0.72), step(gv, 0.075) * smoothstep(0.5, 0.35, u));
    }
    float bar = dots(vec2(u * 140.0, th * 9.0), 0.6, 0.18) * step(u, 0.16);
    col = mix(col, vec3(0.93, 0.92, 0.86), bar);
    vec2 ed = vec2((u - 0.155) * 52.0, (s + 0.10) * 8.0);
    float side = step(0.55, abs(c));
    float eye = length(ed);
    col = mix(col, vec3(0.93, 0.92, 0.88), step(eye, 1.35) * side);
    col = mix(col, vec3(0.04, 0.05, 0.10), step(eye, 0.85) * side);
    col = mix(col, vec3(1.0), step(length(ed - vec2(-0.25, 0.3)), 0.28) * side);
    float ml = abs(s - (-0.18 + u * 0.9));
    col = mix(col, vec3(0.08, 0.10, 0.18), step(ml, 0.035) * step(u, 0.19) * step(0.012, u));
    jit = (vnoise(vec2(u * 30.0, th * 4.0)) - 0.5) * 0.12;
    if(uEmergence > 0.01){
      float wave = fract(u * 3.0 - uTime * 0.8);
      float net = step(0.78, vnoise(vec2(u * 28.0, th * 5.0))) + smoothstep(0.14, 0.0, abs(fract(th * 6.0 + u * 2.0) - 0.5)) * 0.6;
      pulse = clamp(net, 0.0, 1.0) * smoothstep(0.2, 0.9, sin(wave * 3.14159) + 0.35) * uEmergence;
    }
  } else if(uPart < 1.5){
    float top = step(0.0, sin(vUV.y * 3.14159265));
    float mot = step(0.55, vnoise(vec2(u * 18.0, vUV.y * 6.0))) * top * step(0.15, u);
    col = mix(vec3(0.95, 0.95, 0.94), backC * 1.2, mot);
    col = mix(col, vec3(0.93, 0.92, 0.86), dots(vec2(u * 60.0, vUV.y * 8.0), 0.7, 0.2));
    if(uEmergence > 0.01) pulse = step(0.75, vnoise(vec2(u * 16.0, vUV.y * 5.0))) * uEmergence * 0.85;
  } else {
    float top = step(0.0, sin(vUV.y * 3.14159265));
    float rim = step(0.82, abs(cos(vUV.y * 3.14159265)) + u * 0.15);
    col = mix(mix(bellyC, backC, rim), backC, top);
    if(uEmergence > 0.01) pulse = rim * uEmergence;
  }
  col = cel(col, n, v, uWet, jit);
  if(pulse > 0.01){
    vec3 eCol = mix(vec3(0.32, 0.92, 1.0), vec3(1.0, 0.86, 0.36), smoothstep(0.6, 0.1, u));
    col += eCol * pulse * 1.15;
  }
  writeOut(col, normalize(mat3(viewMatrix) * n), vDepth, uId);
}
