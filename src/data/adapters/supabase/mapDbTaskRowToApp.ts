import type { AppTask } from "../../types/appTask.js";
import { getDateBucketFromIso, toIsoDateOnly } from "../../shared/dateUtils.js";
import type { SupabaseTasksReadContext } from "./loadSupabaseTasksReadContext.js";
import { mapDbTaskUpdateToApp } from "./mapDbTaskUpdateToApp.js";

type DbTaskRow = {
  id: string;
  title?: string | null;
  notes?: string | null;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  due_label?: string | null;
  reminder?: AppTask["reminder"];
  created_at?: string | null;
  completed_at?: string | null;
  deleted_at?: string | null;
  category_id?: string | null;
  assignee_id?: string | null;
  deleted_by?: string | null;
};

function toDateOnly(value: unknown): string | null {
  return toIsoDateOnly(value);
}

type DbTaskUpdateRow = Parameters<typeof mapDbTaskUpdateToApp>[0];

/** ממפה שורת tasks לפורמט AppTask (כולל עדכונים אופציונליים) */
export function mapDbTaskRowToApp(
  row: DbTaskRow,
  ctx: SupabaseTasksReadContext,
  updateRows?: DbTaskUpdateRow[]
): AppTask {
  const dueDate = row.due_date || null;
  return {
    id: String(row.id),
    title: row.title || "",
    notes: row.notes || "",
    status: (row.status === "done" ? "done" : "progress") as AppTask["status"],
    priority: (row.priority === "high" ? "high" : "normal") as AppTask["priority"],
    category: ctx.categorySlugById.get(row.category_id || "") || "office",
    assigneeId: row.assignee_id || undefined,
    owner: ctx.profileNameById.get(row.assignee_id || "") || "לא ידוע",
    due_date: dueDate,
    dueLabel: row.due_label ?? null,
    due: getDateBucketFromIso(dueDate, row.status),
    reminder: row.reminder || { enabled: false },
    created_at: toDateOnly(row.created_at),
    completed_at: toDateOnly(row.completed_at),
    deleted_at: toDateOnly(row.deleted_at),
    deleted_by: row.deleted_by ? ctx.profileNameById.get(row.deleted_by) || null : null,
    updates: (updateRows || []).map((updateRow) => mapDbTaskUpdateToApp(updateRow, ctx))
  };
}
