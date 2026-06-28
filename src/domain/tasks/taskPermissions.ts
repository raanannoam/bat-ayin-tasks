import type { AppTask } from "../../data/types/appTask.js";
import { DEMO_USER_OWNER, type AccessContext } from "../shared/appRoles.js";

/** הרשאת צפייה/עריכה בסיסית למשימה */
export function canAccessTask(ctx: AccessContext, task: AppTask | null | undefined): boolean {
  if (!task || task.deleted_at) return false;
  return ctx.role === "manager" || task.owner === DEMO_USER_OWNER;
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
