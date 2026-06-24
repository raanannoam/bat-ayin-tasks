import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppTask } from "../../types/appTask.js";
import { DEFAULT_ORGANIZATION_ID, NO_SUPABASE_AUTH_SESSION_REASON } from "./constants.js";
import { groupTaskUpdatesByTaskId } from "./groupTaskUpdatesByTaskId.js";
import { loadSupabaseTasksReadContext } from "./loadSupabaseTasksReadContext.js";
import { mapDbTaskRowToApp } from "./mapDbTaskRowToApp.js";
import { normalizeTask } from "../../shared/normalizeTask.js";

/** חוזה adapter קריאה — loadTasks בלבד */
export type SupabaseTasksReadAdapter = {
  loadTasks(): Promise<AppTask[]>;
};

/** יוצר adapter קריאה ל-Supabase — tasks + task_updates */
export function createSupabaseTasksReadAdapter(
  client: SupabaseClient | null
): SupabaseTasksReadAdapter {
  return {
    async loadTasks() {
      if (!client) {
        throw new Error("Supabase is not configured.");
      }
      const { data: authData, error: authError } = await client.auth.getSession();
      if (authError) throw authError;
      if (!authData.session) {
        throw new Error(NO_SUPABASE_AUTH_SESSION_REASON);
      }
      const batAyin = client.schema("bat_ayin");
      const ctx = await loadSupabaseTasksReadContext(client);
      const tasksResult = await batAyin
        .from("tasks")
        .select(
          "id, title, notes, status, priority, due_date, due_label, reminder, created_at, completed_at, deleted_at, category_id, assignee_id, deleted_by"
        )
        .eq("organization_id", DEFAULT_ORGANIZATION_ID)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (tasksResult.error) throw tasksResult.error;
      const updatesResult = await batAyin
        .from("task_updates")
        .select("task_id, author_id, body, created_at, notify_participants, notification_status")
        .eq("organization_id", DEFAULT_ORGANIZATION_ID)
        .is("deleted_at", null)
        .order("created_at", { ascending: true });
      if (updatesResult.error) throw updatesResult.error;
      const updatesByTaskId = groupTaskUpdatesByTaskId(updatesResult.data);
      return (tasksResult.data || []).map((row, index) =>
        normalizeTask(mapDbTaskRowToApp(row, ctx, updatesByTaskId.get(row.id) || []), index)
      );
    }
  };
}
