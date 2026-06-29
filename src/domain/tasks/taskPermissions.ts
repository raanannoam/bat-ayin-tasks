import type { AppTask } from "../../data/types/appTask.js";
import type { AccessContext } from "../shared/appRoles.js";
import { isPersonalTask } from "./taskFilters.js";

/** הרשאת צפייה/עריכה בסיסית למשימה */
export function canAccessTask(ctx: AccessContext, task: AppTask | null | undefined): boolean {
  if (!task || task.deleted_at) return false;
  if (ctx.role === "manager") return true;
  return isPersonalTask(task, ctx);
}

/** האם ניתן לערוך תוכן משימה (לא הושלמה) */
export function canEditTaskContent(ctx: AccessContext, task: AppTask | null | undefined): boolean {
  if (!task || !canAccessTask(ctx, task)) return false;
  return task.status !== "done" && !task.deleted_at;
}

/** האם מנהל יכול למחוק משימה */
export function canDeleteTask(ctx: AccessContext, task: AppTask | null | undefined): boolean {
  if (!task) return false;
  return ctx.role === "manager" && !task.deleted_at;
}
