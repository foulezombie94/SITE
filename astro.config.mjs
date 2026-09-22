import { cp, copyFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

const legacyRoot = fileURLToPath(new URL("./legacy-site/", import.meta.url));

const preserveFolkiAssets = {
  name: "preserve-folki-assets",
  hooks: {
    "astro:build:done": async ({ dir }) => {
      const outputRoot = fileURLToPath(dir);
      const files = ["styles.css", "product-overrides.css", "app.js", "product.js"];

      await mkdir(outputRoot, { recursive: true });

      for (const file of files) {
        await copyFile(`${legacyRoot}${file}`, `${outputRoot}${file}`);
      }

      const assetsRoot = `${legacyRoot}assets`;
      if (existsSync(assetsRoot)) {
        await cp(assetsRoot, `${outputRoot}assets`, { recursive: true });
      }
    },
  },
};

export default defineConfig({
  output: "static",
  outDir: "./dist",
  publicDir: "./public",
  build: {
    format: "file",
  },
  integrations: [preserveFolkiAssets],
});

