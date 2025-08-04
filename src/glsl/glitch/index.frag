uniform float uTime;
uniform vec3 uColor;
uniform sampler2D uImage;

varying vec2 vUv;

float rand(vec2 co) {
   return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
}

float offset(float blocks, vec2 uv) {
   float shaderTime = uTime * 0.75;
   return rand(vec2(shaderTime, floor(uv.y * blocks)));
}

void main() {
   vec2 uv = vUv;

   float distortion = offset(32.0, uv) * 0.002;
   vec2 distortedUv = uv + vec2(distortion, 0.0);

   // Apply glitch effect by offsetting UV coordinates
   float glitchOffset = offset(64.0, uv) * 0.01;
   distortedUv.x += glitchOffset;

   // Add a scanline effect
   float scanline = sin(uv.y * 800.0) * 0.01;
   distortedUv.y += scanline;

   vec4 image = texture2D(uImage, distortedUv);

   gl_FragColor = image;
}
