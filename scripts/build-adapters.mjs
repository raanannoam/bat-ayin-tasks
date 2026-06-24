import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const bundlePath = "dist/adapters.js";

await esbuild.build({
  entryPoints: ["src/adaptersBundle.ts"],
  bundle: true,
  format: "iife",
  globalName: "BatAyinAdapters",
  outfile: bundlePath,
  platform: "browser",
  target: ["es2020"],
  logLevel: "info"
});

mkdirSync(dirname("outputs/adapters.js"), { recursive: true });
copyFileSync(bundlePath, "outputs/adapters.js");
