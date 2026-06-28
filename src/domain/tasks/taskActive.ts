import type { AppTask } from "../../data/types/appTask.js";

/** משימות שלא נמחקו (soft delete) */
export function filterActiveTasks(tasks: AppTask[]): AppTask[] {
  return tasks.filter((t) => !t.deleted_at);
}
