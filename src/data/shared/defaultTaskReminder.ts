import type { AppTask } from "../types/appTask.js";

/** תזכורת ברירת מחדל לפי due_date */
export function defaultTaskReminder(task: Pick<AppTask, "due_date">) {
  return {
    enabled: Boolean(task.due_date),
    timing: "before_due" as const,
    amount: 1,
    unit: "day" as const
  };
}
