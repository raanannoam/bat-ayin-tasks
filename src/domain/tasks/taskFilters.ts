import type { AppTask } from "../../data/types/appTask.js";
import { daysBetween } from "../../data/shared/dateUtils.js";
import { personalOwner, type AccessContext } from "../shared/appRoles.js";
import { filterActiveTasks } from "./taskActive.js";

/** משימות של המשתמש האישי לפי תפקיד */
export function filterPersonalTasks(tasks: AppTask[], ctx: AccessContext): AppTask[] {
  return tasks.filter((t) => t.owner === personalOwner(ctx));
}

/** מבצעים לניהול — ללא המבצע האישי */
export function filterManagementPeople(people: string[], ctx: AccessContext): string[] {
  return people.filter((person) => person !== personalOwner(ctx));
}

/** משימה הושלמה לפני 90+ יום — ארכיון */
export function isArchivedDone(task: AppTask): boolean {
  return task.status === "done" && daysBetween(task.completed_at || task.created_at) >= 90;
}

/** משימות שהושלמו — עם/בלי ארכיון */
export function filterVisibleDoneTasks(
  tasks: AppTask[],
  includeArchive = false
): AppTask[] {
  return filterActiveTasks(tasks).filter(
    (t) => t.status === "done" && (includeArchive || !isArchivedDone(t))
  );
}

/** משימות פתוחות (לא done, לא deleted) */
export function filterOpenTasks(tasks: AppTask[]): AppTask[] {
  return filterActiveTasks(tasks).filter((t) => t.status !== "done");
}
