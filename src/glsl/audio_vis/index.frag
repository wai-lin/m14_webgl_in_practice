/// #variables
uniform float u_Time;
uniform float u_AudioDelta;
uniform float u_AudioAmplitude;
uniform float u_AudioEnergy;

varying vec2 v_Uv;
/// #end-variables

/// #functions
float audioRand(vec2 co) {
   return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453) * 2.0 - 1.0;
}

float audioOffset(float blocks, vec2 uv) {
   float shaderTime = u_Time * 0.75;
   return audioRand(vec2(shaderTime, floor(uv.y * blocks)));
}
/// #end-functions

/// #shader
// Get the current fragment color that Three.js has calculated
vec3 baseColor = gl_FragColor.rgb;

// Audio-reactive color modifications - much stronger effects
vec3 audioColor = vec3(
   1.0 + u_AudioAmplitude * 2.0,     // Red responds to volume
   1.0 + u_AudioDelta * 1.5,         // Green responds to frequency changes
   1.0 + u_AudioEnergy * 3.0         // Blue responds to combined energy
);

// Apply audio-reactive tinting
baseColor *= audioColor;

// Add some glitch effect based on audio delta - lower threshold
if (u_AudioDelta > 0.01) {
   float glitchIntensity = u_AudioDelta * 10.0;
   float glitchOffset = audioOffset(32.0, v_Uv) * glitchIntensity * 0.5;

   // Add some color shifting for glitch effect
   baseColor.r += glitchOffset * 0.8;
   baseColor.g -= glitchOffset;
}

// Add brightness pulsing with energy - much stronger
float brightness = 1.0 + u_AudioEnergy * 2.0;
baseColor *= brightness;

// Set the final fragment color
gl_FragColor = vec4(baseColor, gl_FragColor.a);
/// #end-shader