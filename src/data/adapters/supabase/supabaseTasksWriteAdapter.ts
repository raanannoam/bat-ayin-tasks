import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppTask } from "../../types/appTask.js";
import { loadSupabaseTasksReadContext } from "./loadSupabaseTasksReadContext.js";
import { loadSupabaseTasksWriteContext } from "./loadSupabaseTasksWriteContext.js";
import { mapAppTaskToSupabaseInsert } from "./mapAppTaskToSupabaseInsert.js";
import { mapDbTaskRowToApp } from "./mapDbTaskRowToApp.js";
import { normalizeTask } from "../../shared/normalizeTask.js";

const NOT_IMPLEMENTED = "Not implemented yet";

/** חוזה adapter כתיבה — תואם tasksRepository */
export type SupabaseTasksWriteAdapter = {
  createTask(tasks: AppTask[], appTask: AppTask): Promise<AppTask[]>;
  updateTask(tasks: AppTask[], id: string, patch: Partial<AppTask>): never;
  deleteTaskSoft(tasks: AppTask[], id: string, deletedBy: string): never;
  completeTask(tasks: AppTask[], id: string): never;
  reopenTask(tasks: AppTask[], id: string): never;
};

function throwNotImplemented(): never {
  throw new Error(NOT_IMPLEMENTED);
}

/** יוצר adapter כתיבה ל-Supabase — createTask בלבד ממומש ב-CP18 */
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

export { loadSupabaseTasksWriteContext } from "./loadSupabaseTasksWriteContext.js";
export { mapAppTaskToSupabaseInsert } from "./mapAppTaskToSupabaseInsert.js";
