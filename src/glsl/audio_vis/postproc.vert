varying vec2 v_Uv;

void main() {
   gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
   v_Uv = uv;
}