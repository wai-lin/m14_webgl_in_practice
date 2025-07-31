import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { defineConfig } from "vite";
import glsl from "vite-plugin-glsl";

function resolvePath(path: string) {
  return resolve(__dirname, path);
}

export default defineConfig({
  plugins: [tailwindcss(), glsl()],
  resolve: {
    alias: {
      "@components": resolvePath("./src/components"),
      "@lib": resolvePath("./src/lib"),
      "@post_processors": resolvePath("./src/post_processors"),
      "@scenes": resolvePath("./src/scenes"),
      "@store": resolvePath("./src/store"),
      "@": resolvePath("./src"),
    },
  },
});
