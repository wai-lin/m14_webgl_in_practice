uniform sampler2D u_Texture;
uniform float u_BarrelStrength;
uniform float u_AudioDelta;
uniform bool u_AudioThresholdExceed;
uniform bool u_AudioPlaying;

varying vec2 v_Uv;

#include ./barrel.glsl

void main() {
   if(u_AudioPlaying) {
      vec4 sumcol = vec4(0.0);
      vec4 sumw = vec4(0.0);
      for(int i = 0; i < num_iter; ++i) {
         float t = float(i) * reci_num_iter_f;
         vec4 w = spectrum_offset(t);
         sumw += w;

         float strength = u_BarrelStrength + u_AudioDelta;
         if(u_AudioThresholdExceed) {
            strength *= 5.0;
         }
         vec2 barrel = barrelDistortion(v_Uv, .6 * max_distort * t * strength);

         sumcol += w * texture2D(u_Texture, barrel);
      }

      gl_FragColor = sumcol / sumw;
   } else {
      vec4 color = texture2D(u_Texture, v_Uv);
      gl_FragColor = color;
   }

   #include <colorspace_fragment>
}