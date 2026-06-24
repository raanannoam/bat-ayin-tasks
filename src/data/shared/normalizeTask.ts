import type { AppTask } from "../types/appTask.js";
import { defaultTaskReminder } from "./defaultTaskReminder.js";
import { isoDateFromOffset } from "./dateUtils.js";

type TaskUpdate = {
  by?: string;
  text?: string;
  created_at?: string;
  notify_participants?: boolean;
  notification_status?: string;
};

/** מנרמל עדכון משימה בודד */
function normalizeUpdate(update: TaskUpdate, taskIndex: number, updateIndex: number) {
  return {
    by: update.by || "עדינה",
    text: update.text || "",
    created_at: update.created_at || isoDateFromOffset(-(taskIndex + updateIndex + 1)),
    notify_participants: Boolean(update.notify_participants),
    notification_status: update.notification_status || "pending"
  };
}

/** מנרמל משימה לפורמט runtime — תואם outputs/index.html */
export function normalizeTask(task: AppTask, index?: number): AppTask {
  const dueDefaults: Record<string, string> = {
    today: isoDateFromOffset(0),
    tomorrow: isoDateFromOffset(1),
    date: isoDateFromOffset(12)
  };
  const dueDate =
    task.status === "done" || task.due === "done" || task.due === "none"
      ? null
      : task.due_date || dueDefaults[task.due || ""] || null;
  const updates = Array.isArray(task.updates)
    ? task.updates.map((update, updateIndex) =>
        normalizeUpdate(update as TaskUpdate, index as number, updateIndex)
      )
    : [];
  return {
    priority: (index as number) % 5 === 0 ? "high" : "normal",
    created_at: task.created_at || isoDateFromOffset(-((index as number) + 1)),
    ...task,
    due_date: dueDate,
    due: task.due || (dueDate ? "date" : "none"),
    completed_at:
      task.status === "done"
        ? task.completed_at || task.created_at || isoDateFromOffset(-((index as number) + 1))
        : null,
    deleted_at: task.deleted_at || null,
    deleted_by: task.deleted_by || null,
    reminder: task.reminder || defaultTaskReminder({ ...task, due_date: dueDate }),
    updates
  };
}
