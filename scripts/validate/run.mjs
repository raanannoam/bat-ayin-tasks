import { printReport, mergeResults } from "./lib/reporter.mjs";
import { startStaticServer } from "./lib/static-server.mjs";
import { withBrowserPage, runBrowserValidation } from "./lib/browser.mjs";
import { runStaticSuites } from "./suites/static.mjs";

function parseArgs(argv) {
  return {
    staticOnly: argv.includes("--static-only"),
    browserOnly: argv.includes("--browser-only"),
    requireSupabase: argv.includes("--require-supabase"),
    verbose: argv.includes("--verbose"),
    supabaseDebug: argv.includes("--supabase-debug")
  };
}

/** נקודת כניסה יחידה — npm run validate */
export async function main(argv = process.argv.slice(2)) {
  const opts = parseArgs(argv);
  const results = [];

  if (!opts.browserOnly) {
    console.log("=== static validation ===");
    results.push(...await runStaticSuites());
  }

  if (!opts.staticOnly) {
    console.log("\n=== browser integration validation ===");
    const server = await startStaticServer();
    try {
      const query = opts.supabaseDebug ? "?debugBackend=supabase" : "?debugBackend=local";
      await withBrowserPage(server.baseUrl, async (page) => {
        const browserResults = await runBrowserValidation(page, {
          supabase: true,
          requireSupabase: opts.requireSupabase
        });
        results.push(...browserResults);
      }, { query });
    } finally {
      await server.close();
    }
  }

  const exitCode = printReport(results, { verbose: opts.verbose });
  process.exit(exitCode);
}

main().catch(error => {
  console.error("validate failed:", error);
  process.exit(1);
});
