import { createHash } from "node:crypto";
import { readFileSync, existsSync, statSync } from "node:fs";
import { execSync } from "node:child_process";
import { createSuite } from "../lib/reporter.mjs";
import { checkIndexHtmlSyntax } from "../lib/extract-inline-script.mjs";

function hashFile(path) {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

/** build pipeline: src → dist → outputs + tsc + syntax */
export async function runBuildSuite() {
  const suite = createSuite("build");

  await suite.step("src-entry", "src/adaptersBundle.ts exists", () => {
    if (!existsSync("src/adaptersBundle.ts")) throw new Error("missing src/adaptersBundle.ts");
  });

  await suite.step("dist-bundle", "dist/adapters.js exists", () => {
    if (!existsSync("dist/adapters.js")) throw new Error("missing dist/adapters.js — run build:adapters");
  });

  await suite.step("outputs-bundle", "outputs/adapters.js exists", () => {
    if (!existsSync("outputs/adapters.js")) throw new Error("missing outputs/adapters.js");
  });

  await suite.step("bundle-sync", "dist/adapters.js === outputs/adapters.js", () => {
    const distHash = hashFile("dist/adapters.js");
    const outHash = hashFile("outputs/adapters.js");
    if (distHash !== outHash) {
      throw new Error(`hash mismatch dist=${distHash.slice(0, 12)} outputs=${outHash.slice(0, 12)}`);
    }
    return { hash: distHash.slice(0, 16) };
  });

  await suite.step("bundle-exports", "outputs/adapters.js exports BatAyinAdapters factories", () => {
    const js = readFileSync("outputs/adapters.js", "utf8");
    for (const name of ["createSupabaseTasksAdapter", "createSupabaseSuppliersAdapter", "normalizeTask", "normalizeSupplier", "createAsyncRepository"]) {
      if (!js.includes(name)) throw new Error(`missing export symbol: ${name}`);
    }
  });

  await suite.step("html-syntax", "outputs/index.html inline script parses", () => {
    checkIndexHtmlSyntax();
  });

  await suite.step("harness-file", "outputs/validation-harness.js exists", () => {
    if (!existsSync("outputs/validation-harness.js")) throw new Error("missing validation-harness.js");
  });

  await suite.step("typescript", "tsc --noEmit passes", () => {
    execSync("npx tsc --noEmit", { stdio: "pipe" });
  });

  return suite.finish();
}

/** PWA static assets and registration */
export async function runPwaSuite() {
  const suite = createSuite("pwa");

  await suite.step("manifest-json", "manifest.json valid + required fields", () => {
    const manifest = JSON.parse(readFileSync("outputs/manifest.json", "utf8"));
    for (const key of ["name", "start_url", "display", "icons"]) {
      if (!manifest[key]) throw new Error(`manifest missing ${key}`);
    }
    if (!Array.isArray(manifest.icons) || manifest.icons.length === 0) {
      throw new Error("manifest.icons empty");
    }
    return { iconCount: manifest.icons.length };
  });

  await suite.step("service-worker", "service-worker.js exists + cache shell", () => {
    const sw = readFileSync("outputs/service-worker.js", "utf8");
    if (!sw.includes("install") || !sw.includes("fetch")) {
      throw new Error("service-worker missing install/fetch handlers");
    }
    if (!sw.includes("index.html")) throw new Error("APP_SHELL missing index.html");
  });

  await suite.step("html-manifest-link", "index.html links manifest.json", () => {
    const html = readFileSync("outputs/index.html", "utf8");
    if (!html.includes('href="manifest.json"')) throw new Error("manifest link missing");
  });

  await suite.step("html-sw-register", "index.html registers service worker", () => {
    const html = readFileSync("outputs/index.html", "utf8");
    if (!html.includes("serviceWorker.register")) throw new Error("SW registration missing");
  });

  await suite.step("html-harness-script", "index.html loads validation-harness.js", () => {
    const html = readFileSync("outputs/index.html", "utf8");
    if (!html.includes("validation-harness.js")) throw new Error("validation-harness script tag missing");
  });

  const iconPaths = [
    "outputs/icons/icon-192.png",
    "outputs/icons/icon-512.png",
    "outputs/icons/maskable-192.png",
    "outputs/icons/maskable-512.png"
  ];
  const missingIcons = iconPaths.filter(p => !existsSync(p));
  if (missingIcons.length) {
    await suite.step("pwa-icons", "PWA icon PNG files exist", () => {
      throw new Error(`missing icons: ${missingIcons.join(", ")}`);
    });
  } else {
    await suite.step("pwa-icons", "PWA icon PNG files exist", () => {
      const sizes = iconPaths.map(p => statSync(p).size);
      if (sizes.some(s => s < 100)) throw new Error("icon file suspiciously small");
      return { count: iconPaths.length };
    });
  }

  return suite.finish();
}

/** runtime bundle loaded by index.html */
export async function runRuntimeBundleSuite() {
  const suite = createSuite("runtime-bundle");

  await suite.step("adapters-script-tag", "index.html loads adapters.js before app script", () => {
    const html = readFileSync("outputs/index.html", "utf8");
    const adaptersIdx = html.indexOf('src="./adapters.js"');
    const inlineIdx = html.indexOf("<script>\n    function lineIcon");
    if (adaptersIdx < 0 || inlineIdx < 0) throw new Error("script order markers missing");
    if (adaptersIdx > inlineIdx) throw new Error("adapters.js must load before inline script");
  });

  await suite.step("supabase-cdn", "Supabase UMD loaded from CDN", () => {
    const html = readFileSync("outputs/index.html", "utf8");
    if (!html.includes("@supabase/supabase-js")) throw new Error("Supabase CDN script missing");
  });

  await suite.step("data-backend-default", "DATA_BACKEND defaults to local", () => {
    const html = readFileSync("outputs/index.html", "utf8");
    if (!html.includes('isDebugSupabaseBackendEnabled() ? "supabase" : "local"')) {
      throw new Error("DATA_BACKEND local default pattern missing");
    }
  });

  return suite.finish();
}

export async function runStaticSuites() {
  return [await runBuildSuite(), await runPwaSuite(), await runRuntimeBundleSuite()];
}
