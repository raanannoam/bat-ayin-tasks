import type { AppSupplier } from "../../data/types/appSupplier.js";
import { personalOwner, type AccessContext } from "../shared/appRoles.js";

/** הרשאת צפייה/עריכה להזמנת ספק */
export function canAccessSupplier(
  ctx: AccessContext,
  item: AppSupplier | null | undefined
): boolean {
  if (!item || item.deleted_at) return false;
  return ctx.role === "manager" || item.allAssignees || item.assignees.includes(personalOwner(ctx));
}
