// Overlay beams, constellation links, and lighthouse light cone
attribute vec4 aBeam; // x: u along beam (0..1), y: v across (-1..1), z: weight/width, w: phase
varying vec4 vBeam;
varying vec3 vWorld;
varying float vDepth;
void main(){
  vBeam = aBeam;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mv = viewMatrix * wp;
  vDepth = -mv.z;
  gl_Position = projectionMatrix * mv;
}
