import * as esbuild from "esbuild";
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname } from "node:path";

const bundlePath = "dist/adapters.js";
const outputsPath = "outputs/adapters.js";

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

mkdirSync(dirname(outputsPath), { recursive: true });
copyFileSync(bundlePath, outputsPath);

// אימות שהעתקה הצליחה — מונע drift בין dist ל-outputs
const hash = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
if (hash(bundlePath) !== hash(outputsPath)) {
  throw new Error("Copy failed: dist/adapters.js !== outputs/adapters.js");
}
console.log("Copied dist/adapters.js → outputs/adapters.js (verified)");
