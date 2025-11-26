import { defineConfig } from "vite";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

export default defineConfig({
  root: ".",
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
  server: {
    port: 4173,
  },
  plugins: [
    {
      name: "copy-env",
      closeBundle() {
        const envPath = join(process.cwd(), "env.js");
        const distEnvPath = join(process.cwd(), "dist", "env.js");
        const distHtmlPath = join(process.cwd(), "dist", "index.html");
        
        if (existsSync(envPath)) {
          copyFileSync(envPath, distEnvPath);
          console.log("✓ Copied env.js to dist/");
        }
        
        if (existsSync(distHtmlPath)) {
          let html = readFileSync(distHtmlPath, "utf-8");
          if (!html.includes('src="./env.js"')) {
            html = html.replace(
              "</body>",
              '    <script src="./env.js"></script>\n  </body>'
            );
            writeFileSync(distHtmlPath, html);
            console.log("✓ Added env.js script to index.html");
          }
        }
      },
    },
  ],
});

