/** דיווח מובנה לסuites — מזהה בדיוק איזה step נכשל */

export function createSuite(name) {
  const steps = [];
  return {
    name,
    async step(id, label, fn) {
      try {
        const detail = await fn();
        steps.push({ id, label, ok: true, detail: detail ?? null });
        return true;
      } catch (error) {
        steps.push({
          id,
          label,
          ok: false,
          error: error?.message || String(error)
        });
        return false;
      }
    },
    skip(id, label, reason) {
      steps.push({ id, label, ok: true, skipped: true, reason });
    },
    finish() {
      const failed = steps.filter(s => !s.ok);
      const skipped = steps.filter(s => s.skipped);
      return {
        suite: name,
        ok: failed.length === 0,
        steps,
        failed: failed.map(s => s.id),
        skipped: skipped.map(s => s.id)
      };
    }
  };
}

export function printReport(results, { verbose = false } = {}) {
  let totalFailed = 0;
  let totalSkipped = 0;
  for (const result of results) {
    const icon = result.ok ? "PASS" : "FAIL";
    console.log(`\n[${icon}] ${result.suite}`);
    for (const step of result.steps) {
      if (step.skipped) {
        totalSkipped++;
        console.log(`  SKIP  ${step.id} — ${step.label} (${step.reason})`);
        continue;
      }
      const mark = step.ok ? "ok" : "FAIL";
      console.log(`  ${mark}  ${step.id} — ${step.label}`);
      if (!step.ok) {
        console.log(`        ${step.error}`);
        totalFailed++;
      } else if (verbose && step.detail) {
        console.log(`        ${JSON.stringify(step.detail)}`);
      }
    }
    if (result.failed?.length) {
      console.log(`  failed steps: ${result.failed.join(", ")}`);
    }
  }
  const allOk = results.every(r => r.ok);
  console.log(`\n--- validate summary: ${results.length} suites, ${totalFailed} failed steps, ${totalSkipped} skipped ---`);
  return allOk ? 0 : 1;
}

export function mergeResults(...groups) {
  return groups.flat();
}
