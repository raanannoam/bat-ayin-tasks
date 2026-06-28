import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppTask } from "../../types/appTask.js";
import { createSupabaseTasksReadAdapter } from "./supabaseTasksReadAdapter.js";
import { createSupabaseTasksWriteAdapter } from "./supabaseTasksWriteAdapter.js";

/** חוזה adapter משימות — parity עם localTasksAdapter */
export type SupabaseTasksAdapter = {
  loadTasks(): Promise<AppTask[]>;
  saveTasks(tasks: AppTask[]): AppTask[];
  createTask(tasks: AppTask[], appTask: AppTask): Promise<AppTask[]>;
  updateTask(tasks: AppTask[], id: string, patch: Partial<AppTask>): Promise<AppTask[]>;
  deleteTaskSoft(tasks: AppTask[], id: string, deletedBy: string): Promise<AppTask[]>;
  completeTask(tasks: AppTask[], id: string): Promise<AppTask[]>;
  reopenTask(tasks: AppTask[], id: string): Promise<AppTask[]>;
};

/** adapter מאוחד — read + write + saveTasks noop */
export function createSupabaseTasksAdapter(client: SupabaseClient | null): SupabaseTasksAdapter {
  const readAdapter = createSupabaseTasksReadAdapter(client);
  const writeAdapter = createSupabaseTasksWriteAdapter(client);
  return {
    loadTasks() {
      return readAdapter.loadTasks();
    },
    saveTasks(tasks) {
      return tasks;
    },
    createTask(tasks, appTask) {
      return writeAdapter.createTask(tasks, appTask);
    },
    updateTask(tasks, id, patch) {
      return writeAdapter.updateTask(tasks, id, patch);
    },
    deleteTaskSoft(tasks, id, deletedBy) {
      return writeAdapter.deleteTaskSoft(tasks, id, deletedBy);
    },
    completeTask(tasks, id) {
      return writeAdapter.completeTask(tasks, id);
    },
    reopenTask(tasks, id) {
      return writeAdapter.reopenTask(tasks, id);
    }
  };
}
