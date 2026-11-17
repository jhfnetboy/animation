attribute vec3 aColor;
attribute float aBoost;
varying vec3 vColor;
varying float vBoost;
#include vstd
void main(){
  vColor = aColor;
  vBoost = aBoost;
  stdVertex(position, normal);
}
