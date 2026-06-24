import type { SupabaseTasksReadContext } from "./loadSupabaseTasksReadContext.js";

type DbTaskUpdateRow = {
  author_id?: string | null;
  body?: string | null;
  created_at?: string | null;
  notify_participants?: boolean | null;
  notification_status?: string | null;
};

function toDateOnly(value: unknown): string | null {
  if (!value) return null;
  const text = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

/** ממפה שורת task_updates לפורמט עדכון באפליקציה */
export function mapDbTaskUpdateToApp(row: DbTaskUpdateRow, ctx: SupabaseTasksReadContext) {
  return {
    by: ctx.profileNameById.get(row.author_id || "") || "לא ידוע",
    text: row.body || "",
    created_at: toDateOnly(row.created_at),
    notify_participants: Boolean(row.notify_participants),
    notification_status: row.notification_status || "pending"
  };
}
