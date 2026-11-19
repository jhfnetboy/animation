attribute vec2 aHull;
varying vec2 vHull; varying vec3 vLocal;
#include vstd
void main(){ vHull = aHull; vLocal = position; stdVertex(position, normal); }
