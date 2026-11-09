import { copyFileSync } from "node:fs";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

function pagesSpa(): Plugin {
  return {
    name: "pages-spa",
    apply: "build",
    closeBundle() {
      copyFileSync("docs/index.html", "docs/404.html");
    },
  };
}

export default defineConfig({
  plugins: [react(), pagesSpa()],
  build: {
    outDir: "docs",
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});
