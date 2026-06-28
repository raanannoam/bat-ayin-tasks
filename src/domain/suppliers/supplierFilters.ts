import type { AppSupplier } from "../../data/types/appSupplier.js";
import type { SupplierStepMeta } from "../../data/catalog/supplierStepsMeta.js";
import type { AccessContext } from "../shared/appRoles.js";
import { canAccessSupplier } from "./supplierPermissions.js";
import { supplierProgress } from "./supplierProgress.js";

/** מיון רשימת ספקים — פתוחות קודם, יעד, שם */
export function compareSuppliersForList(
  a: AppSupplier,
  b: AppSupplier,
  steps: SupplierStepMeta[]
): number {
  const aDone = supplierProgress(a, steps).complete ? 1 : 0;
  const bDone = supplierProgress(b, steps).complete ? 1 : 0;
  return (
    aDone - bDone ||
    (a.due_date || "9999").localeCompare(b.due_date || "9999") ||
    a.supplier.localeCompare(b.supplier, "he")
  );
}

/** ספקים גלויים למשתמש — מסוננים וממוינים */
export function filterVisibleSuppliers(
  suppliers: AppSupplier[],
  ctx: AccessContext,
  steps: SupplierStepMeta[]
): AppSupplier[] {
  return suppliers.filter((item) => canAccessSupplier(ctx, item)).sort((a, b) => compareSuppliersForList(a, b, steps));
}
