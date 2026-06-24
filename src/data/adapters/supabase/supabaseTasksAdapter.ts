import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppTask } from "../../types/appTask.js";
import { createSupabaseTasksReadAdapter } from "./supabaseTasksReadAdapter.js";
import { createSupabaseTasksWriteAdapter } from "./supabaseTasksWriteAdapter.js";

const NOT_IMPLEMENTED = "Not implemented yet";

/** חוזה adapter משימות — parity עם localTasksAdapter */
export type SupabaseTasksAdapter = {
  loadTasks(): Promise<AppTask[]>;
  saveTasks(tasks: AppTask[]): AppTask[];
  createTask(tasks: AppTask[], appTask: AppTask): Promise<AppTask[]>;
  updateTask(tasks: AppTask[], id: string, patch: Partial<AppTask>): never;
  deleteTaskSoft(tasks: AppTask[], id: string, deletedBy: string): never;
  completeTask(tasks: AppTask[], id: string): never;
  reopenTask(tasks: AppTask[], id: string): never;
};

function throwNotImplemented(): never {
  throw new Error(NOT_IMPLEMENTED);
}

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
    updateTask() {
      return throwNotImplemented();
    },
    deleteTaskSoft() {
      return throwNotImplemented();
    },
    completeTask() {
      return throwNotImplemented();
    },
    reopenTask() {
      return throwNotImplemented();
    }
  };
}
