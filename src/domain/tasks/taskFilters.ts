import type { AppTask } from "../../data/types/appTask.js";
import { daysBetween } from "../../data/shared/dateUtils.js";
import { personalOwner, type AccessContext } from "../shared/appRoles.js";
import { filterActiveTasks } from "./taskActive.js";

/** האם משימה שייכת למשתמש המחובר — uid ב-Supabase, שם ב-local */
export function isPersonalTask(task: AppTask, ctx: AccessContext): boolean {
  if (ctx.userId && task.assigneeId) {
    return task.assigneeId === ctx.userId;
  }
  return task.owner === personalOwner(ctx);
}

/** משימות של המשתמש האישי לפי תפקיד */
export function filterPersonalTasks(tasks: AppTask[], ctx: AccessContext): AppTask[] {
  return tasks.filter((t) => isPersonalTask(t, ctx));
}

/** מבצעים לניהול — ללא המבצע האישי */
export function filterManagementPeople(people: string[], ctx: AccessContext): string[] {
  return people.filter((person) => person !== personalOwner(ctx));
}

export type ManagementAssigneeRow = {
  label: string;
  person: string;
};

/** שורות מבצעים במסך ניהול משימות — "אני" ואז שאר הארגון */
export function buildManagementTaskAssignees(
  people: string[],
  ctx: AccessContext
): ManagementAssigneeRow[] {
  const owner = personalOwner(ctx);
  const rows: ManagementAssigneeRow[] = [];
  if (owner) {
    rows.push({ label: "אני", person: owner });
  }
  for (const person of filterManagementPeople(people, ctx)) {
    rows.push({ label: person, person });
  }
  return rows;
}

/** ימים לפני שמשימה שהושלמה נחשבת ארכיון — זהה לספקים */
export const DONE_ARCHIVE_DAYS = 30;

/** משימה הושלמה לפני 30+ יום — ארכיון */
export function isArchivedDone(task: AppTask): boolean {
  return task.status === "done" && daysBetween(task.completed_at || task.created_at) >= DONE_ARCHIVE_DAYS;
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
