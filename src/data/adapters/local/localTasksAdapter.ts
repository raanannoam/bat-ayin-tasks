import type { AppTask } from "../../types/appTask.js";
import { defaultTaskReminder } from "../../shared/defaultTaskReminder.js";
import { isoDateFromOffset } from "../../shared/dateUtils.js";
import { normalizeTask } from "../../shared/normalizeTask.js";
import { safeParseStorage, writeStorageJson } from "../../shared/browserStorage.js";
import { DATA_VERSION, STARTER_TASKS } from "./starterTasks.js";

/** חוזה adapter משימות מקומי — parity עם SupabaseTasksAdapter (סינכרוני) */
export type LocalTasksAdapter = {
  loadTasks(): AppTask[];
  saveTasks(tasks: AppTask[]): AppTask[];
  createTask(tasks: AppTask[], task: AppTask): AppTask[];
  updateTask(tasks: AppTask[], id: string, patch: Partial<AppTask>): AppTask[];
  deleteTaskSoft(tasks: AppTask[], id: string, deletedBy: string): AppTask[];
  completeTask(tasks: AppTask[], id: string): AppTask[];
  reopenTask(tasks: AppTask[], id: string): AppTask[];
};

/** adapter localStorage למשימות — production path */
export function createLocalTasksAdapter(): LocalTasksAdapter {
  return {
    loadTasks() {
      if (localStorage.getItem("beit-version") !== DATA_VERSION) {
        writeStorageJson("beit-tasks", STARTER_TASKS);
        localStorage.setItem("beit-version", DATA_VERSION);
      }
      const value = safeParseStorage<unknown>("beit-tasks", null);
      const raw = Array.isArray(value) ? value : STARTER_TASKS;
      return raw.map((task) => normalizeTask(task));
    },
    saveTasks(tasks) {
      writeStorageJson("beit-tasks", tasks);
      return tasks;
    },
    createTask(tasks, task) {
      return this.saveTasks([task, ...tasks]);
    },
    updateTask(tasks, id, patch) {
      return this.saveTasks(tasks.map((task) => (task.id === id ? { ...task, ...patch } : task)));
    },
    deleteTaskSoft(tasks, id, deletedBy) {
      return this.updateTask(tasks, id, { deleted_at: isoDateFromOffset(0), deleted_by: deletedBy });
    },
    completeTask(tasks, id) {
      const task = tasks.find((item) => item.id === id);
      if (!task) return tasks;
      return this.updateTask(tasks, id, {
        status: "done",
        due: "done",
        due_date: null,
        dueLabel: "הושלם · היום",
        completed_at: isoDateFromOffset(0),
        reminder: { ...task.reminder, enabled: false }
      });
    },
    reopenTask(tasks, id) {
      const task = tasks.find((item) => item.id === id);
      if (!task) return tasks;
      const dueDate = task.due === "done" ? isoDateFromOffset(0) : task.due_date;
      return this.updateTask(tasks, id, {
        status: "progress",
        due: task.due === "done" ? "today" : task.due,
        due_date: dueDate,
        dueLabel: task.due === "done" ? "היום · שלישי" : task.dueLabel,
        completed_at: null,
        reminder: defaultTaskReminder({ ...task, due_date: dueDate })
      });
    }
  };
}
