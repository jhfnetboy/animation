// Overlay stardust & underwater token fish/constellation nodes (camera-facing cards)
attribute vec3 aColor;
attribute vec3 aMeta; // x: shape (0=gem, 1=star, 2=fish-glyph), y: boost, z: seed
varying vec2 vQ;
varying vec3 vColor;
varying vec3 vMeta;
varying float vDepth;
void main(){
  vec3 c = (modelMatrix * instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0)).xyz;
  float s = length(instanceMatrix[0].xyz);
  vec4 cv = viewMatrix * vec4(c, 1.0);
  cv.xy += position.xy * s;
  vQ = position.xy;
  vColor = aColor;
  vMeta = aMeta;
  vDepth = -cv.z;
  gl_Position = projectionMatrix * cv;
}
