uniform vec3 uColor;
uniform float uIntensity;
varying float vDistortion;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {
    // Simple directional lighting
    vec3 lightDirection = normalize(vec3(1.0, 1.0, 2.0));
    vec3 normal = normalize(vNormal);
    
    // Diffuse lighting calculation
    float diffuse = max(dot(normal, lightDirection), 0.0);
    
    // Add ambient light to prevent pure black areas
    float ambient = 0.3;
    float lighting = ambient + diffuse * 0.7;
    
    // Use the distortion to modify color intensity
    vec3 baseColor = uColor * (uIntensity + vDistortion * 0.5);
    vec3 finalColor = baseColor * lighting;
    
    gl_FragColor = vec4(finalColor, 1.0);
}
