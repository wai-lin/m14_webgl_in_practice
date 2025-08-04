uniform float uTime;
varying float vDistortion;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // Create a copy of the position to modify
    vec3 newPosition = position;
    
    // Animate the squash factor using sine wave
    float animatedSquash = 0.5 + 0.3 * sin(uTime * 2.0); // Oscillates between 0.2 and 0.8
    float minSquash = 0.2; // Minimum squash to prevent weird appearance
    float squashFactor = max(animatedSquash, minSquash);
    newPosition.y *= squashFactor;
    
    // Calculate distortion amount to pass to fragment shader
    vDistortion = 1.0 - squashFactor; // Higher distortion when more squashed
    
    // Pass normal and position to fragment shader for lighting
    vNormal = normalize(normalMatrix * normal);
    vPosition = (modelViewMatrix * vec4(newPosition, 1.0)).xyz;
    
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
}
