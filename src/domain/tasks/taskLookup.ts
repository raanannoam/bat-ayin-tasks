import type { AppTask } from "../../data/types/appTask.js";
import type { AccessContext } from "../shared/appRoles.js";
import { canAccessTask } from "./taskPermissions.js";

/** מציאת משימה לפי id */
export function findTask(tasks: AppTask[], id: string): AppTask | undefined {
  return tasks.find((x) => x.id === id);
}

/** משימה גלויה — null אם אין הרשאה */
export function findVisibleTask(
  tasks: AppTask[],
  id: string,
  ctx: AccessContext
): AppTask | null {
  const task = findTask(tasks, id);
  return canAccessTask(ctx, task) ? task ?? null : null;
}
