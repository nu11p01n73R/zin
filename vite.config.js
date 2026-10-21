import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { viteSingleFile } from "vite-plugin-singlefile";

// base "./" so the app works under user.github.io/<repo>/.
// sentences.json stays in public/ and is copied, not inlined.
export default defineConfig({
  base: "./",
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: "dist",
  },
  test: {
    environment: "jsdom",
    setupFiles: "./tests/setup.js",
  },
});
