import type { SupabaseClient } from "@supabase/supabase-js";
import type { SupabaseTasksWriteContext } from "../../types/supabaseWriteContext.js";

type AppTaskUpdate = {
  by?: string;
  text?: string;
  created_at?: string;
  notify_participants?: boolean;
  notification_status?: string;
};

/** מוסיף עדכונים חדשים ל-task_updates */
async function insertAppTaskUpdates(
  client: SupabaseClient,
  taskId: string,
  updates: AppTaskUpdate[],
  writeCtx: SupabaseTasksWriteContext
): Promise<void> {
  if (!updates.length) return;
  const rows = updates.map((update) => {
    const authorName = String(update.by ?? "").trim();
    const authorId = writeCtx.profileIdByName.get(authorName);
    if (!authorId) {
      throw new Error(`Update author not found: ${authorName}`);
    }
    return {
      organization_id: writeCtx.organizationId,
      task_id: taskId,
      author_id: authorId,
      body: update.text ?? "",
      notify_participants: Boolean(update.notify_participants),
      notification_status: update.notification_status || "pending"
    };
  });
  const { error } = await client.schema("bat_ayin").from("task_updates").insert(rows);
  if (error) throw error;
}

/** מעדכן body לפי סדר העדכונים הקיים */
async function syncEditedTaskUpdatesByIndex(
  client: SupabaseClient,
  taskId: string,
  previous: AppTaskUpdate[],
  next: AppTaskUpdate[],
  writeCtx: SupabaseTasksWriteContext
): Promise<void> {
  if (previous.length !== next.length) return;
  const batAyin = client.schema("bat_ayin");
  const rowsResult = await batAyin
    .from("task_updates")
    .select("id")
    .eq("task_id", taskId)
    .eq("organization_id", writeCtx.organizationId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });
  if (rowsResult.error) throw rowsResult.error;
  const rows = rowsResult.data || [];
  for (let index = 0; index < next.length; index += 1) {
    if (previous[index]?.text === next[index]?.text) continue;
    const rowId = rows[index]?.id;
    if (!rowId) continue;
    const { error } = await batAyin.from("task_updates").update({ body: next[index]?.text || "" }).eq("id", rowId);
    if (error) throw error;
  }
}

/** מסנכרן מערך updates של האפליקציה ל-Supabase */
export async function syncAppTaskUpdates(
  client: SupabaseClient,
  taskId: string,
  previous: unknown[] | undefined,
  next: unknown[] | undefined,
  writeCtx: SupabaseTasksWriteContext
): Promise<void> {
  const prev = Array.isArray(previous) ? (previous as AppTaskUpdate[]) : [];
  const nxt = Array.isArray(next) ? (next as AppTaskUpdate[]) : [];
  if (nxt.length > prev.length) {
    await insertAppTaskUpdates(client, taskId, nxt.slice(prev.length), writeCtx);
  }
  await syncEditedTaskUpdatesByIndex(client, taskId, prev, nxt, writeCtx);
}
