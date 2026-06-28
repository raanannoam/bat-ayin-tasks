import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppTask } from "../../types/appTask.js";
import { defaultTaskReminder } from "../../shared/defaultTaskReminder.js";
import { isoDateFromOffset } from "../../shared/dateUtils.js";
import { fetchSupabaseTaskById } from "./fetchSupabaseTaskById.js";
import { loadSupabaseTasksWriteContext } from "./loadSupabaseTasksWriteContext.js";
import { mapAppTaskPatchToSupabaseUpdate } from "./mapAppTaskPatchToSupabaseUpdate.js";
import { syncAppTaskUpdates } from "./syncAppTaskUpdates.js";

/** מעדכן משימה ב-Supabase ומחזיר רשימת runtime מעודכנת */
export async function applySupabaseTaskPatch(
  client: SupabaseClient | null,
  tasks: AppTask[],
  id: string,
  patch: Partial<AppTask>
): Promise<AppTask[]> {
  if (!client) {
    throw new Error("Supabase is not configured.");
  }
  const existing = tasks.find((task) => task.id === id);
  if (!existing) return tasks;

  const contextResult = await loadSupabaseTasksWriteContext(client);
  if (!contextResult.ok) {
    throw new Error(contextResult.reason || contextResult.code || "Write context load failed.");
  }

  const mapResult = mapAppTaskPatchToSupabaseUpdate(patch, contextResult.ctx);
  if (!mapResult.ok) {
    throw new Error(mapResult.reason || mapResult.code || "Task patch mapping failed.");
  }

  const payload = mapResult.payload;
  if (Object.keys(payload).length > 0) {
    const { error } = await client
      .schema("bat_ayin")
      .from("tasks")
      .update(payload)
      .eq("id", id)
      .eq("organization_id", contextResult.ctx.organizationId);
    if (error) throw error;
  }

  if ("updates" in patch) {
    await syncAppTaskUpdates(client, id, existing.updates, patch.updates, contextResult.ctx);
  }

  const updatedTask = await fetchSupabaseTaskById(client, id, {
    includeDeleted: Boolean(patch.deleted_at)
  });
  return tasks.map((task) => (task.id === id ? updatedTask : task));
}

/** patch השלמת משימה — parity עם localTasksAdapter */
export function buildCompleteTaskPatch(task: AppTask): Partial<AppTask> {
  return {
    status: "done",
    due: "done",
    due_date: null,
    dueLabel: "הושלם · היום",
    completed_at: isoDateFromOffset(0),
    reminder: { ...(task.reminder || { enabled: false }), enabled: false }
  };
}

/** patch החזרה לתהליך — parity עם localTasksAdapter */
export function buildReopenTaskPatch(task: AppTask): Partial<AppTask> {
  const dueDate = task.due === "done" ? isoDateFromOffset(0) : task.due_date ?? null;
  return {
    status: "progress",
    due: task.due === "done" ? "today" : task.due,
    due_date: dueDate,
    dueLabel: task.due === "done" ? "היום · שלישי" : task.dueLabel ?? null,
    completed_at: null,
    reminder: defaultTaskReminder({ ...task, due_date: dueDate })
  };
}

/** patch מחיקה רכה — parity עם localTasksAdapter */
export function buildDeleteTaskSoftPatch(deletedBy: string): Partial<AppTask> {
  return {
    deleted_at: isoDateFromOffset(0),
    deleted_by: deletedBy
  };
}
