import type { AppSupplier } from "../../data/types/appSupplier.js";
import type { AccessContext } from "../shared/appRoles.js";
import { canAccessSupplier } from "./supplierPermissions.js";

/** מציאת הזמנת ספק לפי id */
export function findSupplier(suppliers: AppSupplier[], id: string): AppSupplier | undefined {
  return suppliers.find((item) => item.id === id);
}

/** הזמנה גלויה — null אם אין הרשאה */
export function findVisibleSupplier(
  suppliers: AppSupplier[],
  id: string,
  ctx: AccessContext
): AppSupplier | null {
  const item = findSupplier(suppliers, id);
  return canAccessSupplier(ctx, item) ? item ?? null : null;
}
