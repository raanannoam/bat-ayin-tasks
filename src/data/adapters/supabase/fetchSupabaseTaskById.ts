import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppTask } from "../../types/appTask.js";
import { normalizeTask } from "../../shared/normalizeTask.js";
import { DEFAULT_ORGANIZATION_ID } from "./constants.js";
import { loadSupabaseTasksReadContext } from "./loadSupabaseTasksReadContext.js";
import { mapDbTaskRowToApp } from "./mapDbTaskRowToApp.js";

type FetchTaskOptions = {
  includeDeleted?: boolean;
};

/** טוען משימה בודדת + עדכונים מ-Supabase */
export async function fetchSupabaseTaskById(
  client: SupabaseClient,
  taskId: string,
  options: FetchTaskOptions = {}
): Promise<AppTask> {
  const ctx = await loadSupabaseTasksReadContext(client);
  const batAyin = client.schema("bat_ayin");
  let taskQuery = batAyin
    .from("tasks")
    .select(
      "id, title, notes, status, priority, due_date, due_label, reminder, created_at, completed_at, deleted_at, category_id, assignee_id, deleted_by"
    )
    .eq("id", taskId)
    .eq("organization_id", DEFAULT_ORGANIZATION_ID);
  if (!options.includeDeleted) {
    taskQuery = taskQuery.is("deleted_at", null);
  }
  const taskResult = await taskQuery.single();
  if (taskResult.error) throw taskResult.error;

  const updatesResult = await batAyin
    .from("task_updates")
    .select("author_id, body, created_at, notify_participants, notification_status")
    .eq("task_id", taskId)
    .eq("organization_id", DEFAULT_ORGANIZATION_ID)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (updatesResult.error) throw updatesResult.error;

  return normalizeTask(mapDbTaskRowToApp(taskResult.data, ctx, updatesResult.data || []));
}
