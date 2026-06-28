import type { AppSupplier } from "../../data/types/appSupplier.js";
import type { SupplierStepMeta } from "../../data/catalog/supplierStepsMeta.js";

export type SupplierProgress = {
  done: number;
  total: number;
  complete: boolean;
};

/** ספירת שלבי ספק שהושלמו */
export function supplierProgress(
  item: AppSupplier,
  steps: SupplierStepMeta[]
): SupplierProgress {
  const done = steps.filter((step) => item.steps[step.id]).length;
  return { done, total: steps.length, complete: done === steps.length };
}
