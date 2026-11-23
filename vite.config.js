import { defineConfig } from "vite";
export default defineConfig({
  base: "/portfolio/",
  server: { watch: { ignored: ["**/analysis/**"] } },
  build: { rollupOptions: { output: { manualChunks: { three: ["three"] } } } },
});
