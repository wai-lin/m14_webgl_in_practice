import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import glsl from "vite-plugin-glsl";

function resolvePath(path: string) {
  return resolve(__dirname, path);
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), tailwindcss(), glsl()],
  resolve: {
    alias: {
      "@components": resolvePath("./src/components"),
      "@composables": resolvePath("./src/composables"),
      "@lib": resolvePath("./src/lib"),
      "@post_processors": resolvePath("./src/post_processors"),
      "@scenes": resolvePath("./src/scenes"),
      "@store": resolvePath("./src/store"),
      "@": resolvePath("./src"),
    },
  },
})
