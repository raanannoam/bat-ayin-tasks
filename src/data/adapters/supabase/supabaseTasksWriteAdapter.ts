import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppTask } from "../../types/appTask.js";
import {
  applySupabaseTaskPatch,
  buildCompleteTaskPatch,
  buildDeleteTaskSoftPatch,
  buildReopenTaskPatch
} from "./applySupabaseTaskPatch.js";
import { loadSupabaseTasksWriteContext } from "./loadSupabaseTasksWriteContext.js";
import { mapAppTaskToSupabaseInsert } from "./mapAppTaskToSupabaseInsert.js";
import { loadSupabaseTasksReadContext } from "./loadSupabaseTasksReadContext.js";
import { mapDbTaskRowToApp } from "./mapDbTaskRowToApp.js";
import { normalizeTask } from "../../shared/normalizeTask.js";

/** חוזה adapter כתיבה — תואם tasksRepository */
export type SupabaseTasksWriteAdapter = {
  createTask(tasks: AppTask[], appTask: AppTask): Promise<AppTask[]>;
  updateTask(tasks: AppTask[], id: string, patch: Partial<AppTask>): Promise<AppTask[]>;
  deleteTaskSoft(tasks: AppTask[], id: string, deletedBy: string): Promise<AppTask[]>;
  completeTask(tasks: AppTask[], id: string): Promise<AppTask[]>;
  reopenTask(tasks: AppTask[], id: string): Promise<AppTask[]>;
};

/** יוצר adapter כתיבה ל-Supabase */
export function createSupabaseTasksWriteAdapter(
  client: SupabaseClient | null
): SupabaseTasksWriteAdapter {
  return {
    async createTask(tasks, appTask) {
      if (!client) {
        throw new Error("Supabase is not configured.");
      }
      const contextResult = await loadSupabaseTasksWriteContext(client);
      if (!contextResult.ok) {
        throw new Error(contextResult.reason || contextResult.code || "Write context load failed.");
      }
      const mapperResult = mapAppTaskToSupabaseInsert(appTask, contextResult.ctx);
      if (!mapperResult.ok) {
        throw new Error(mapperResult.reason || mapperResult.code || "Task mapping failed.");
      }
      const { data, error } = await client
        .schema("bat_ayin")
        .from("tasks")
        .insert(mapperResult.payload)
        .select()
        .single();
      if (error) throw error;
      const readCtx = await loadSupabaseTasksReadContext(client);
      const createdTask = normalizeTask(mapDbTaskRowToApp(data, readCtx));
      return [createdTask, ...(tasks || [])];
    },
    updateTask(tasks, id, patch) {
      return applySupabaseTaskPatch(client, tasks, id, patch);
    },
    deleteTaskSoft(tasks, id, deletedBy) {
      return applySupabaseTaskPatch(client, tasks, id, buildDeleteTaskSoftPatch(deletedBy));
    },
    completeTask(tasks, id) {
      const task = tasks.find((item) => item.id === id);
      if (!task) return Promise.resolve(tasks);
      return applySupabaseTaskPatch(client, tasks, id, buildCompleteTaskPatch(task));
    },
    reopenTask(tasks, id) {
      const task = tasks.find((item) => item.id === id);
      if (!task) return Promise.resolve(tasks);
      return applySupabaseTaskPatch(client, tasks, id, buildReopenTaskPatch(task));
    }
  };
}

export { loadSupabaseTasksWriteContext } from "./loadSupabaseTasksWriteContext.js";
export { mapAppTaskToSupabaseInsert } from "./mapAppTaskToSupabaseInsert.js";
