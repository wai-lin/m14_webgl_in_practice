/// #variables
varying vec2 v_Uv;
/// #end-variables

/// #shader
v_Uv = uv;

gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
/// #end-shader