import type { AppTask } from "../../data/types/appTask.js";
import { daysFromTodayIso, isoDateFromOffset, toIsoDateOnly } from "../../data/shared/dateUtils.js";
import { formatHebrewDate } from "../shared/formatHebrewDate.js";

/** האם משימה עברה את תאריך היעד */
export function isTaskOverdue(task: AppTask): boolean {
  if (task.status === "done" || !task.due_date) return false;
  const dueOnly = toIsoDateOnly(task.due_date);
  return dueOnly ? dueOnly < isoDateFromOffset(0) : false;
}

/** תווית יעד להצגה */
export function buildTaskDueLabel(task: AppTask): string {
  if (task.status === "done") return task.dueLabel || "הושלם";
  if (!task.due_date) return "ללא יעד";
  if (isTaskOverdue(task)) return `עבר יעד • ${formatHebrewDate(task.due_date)}`;
  const diff = daysFromTodayIso(task.due_date);
  if (diff === 0) return `היום · ${formatHebrewDate(task.due_date).split(" · ")[0]}`;
  if (diff === 1) return `מחר · ${formatHebrewDate(task.due_date).split(" · ")[0]}`;
  return formatHebrewDate(task.due_date);
}

/** דירוג יעד למיון — נמוך = דחוף יותר */
export function taskDueRank(task: AppTask): number {
  if (task.status === "done") return 5;
  if (isTaskOverdue(task)) return 0;
  if (!task.due_date) return 4;
  const diff = daysFromTodayIso(task.due_date);
  if (diff === 0) return 1;
  if (diff === 1) return 2;
  return 3;
}
