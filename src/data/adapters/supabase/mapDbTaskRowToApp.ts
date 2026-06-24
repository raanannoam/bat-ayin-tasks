import type { AppTask } from "../../types/appTask.js";
import type { SupabaseTasksReadContext } from "./loadSupabaseTasksReadContext.js";

type DbTaskRow = {
  id: string;
  title?: string | null;
  notes?: string | null;
  status?: string | null;
  priority?: string | null;
  due_date?: string | null;
  reminder?: AppTask["reminder"];
  created_at?: string | null;
  completed_at?: string | null;
  category_id?: string | null;
  assignee_id?: string | null;
  deleted_by?: string | null;
};

function toDateOnly(value: unknown): string | null {
  if (!value) return null;
  const text = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

function deriveTaskDue(status: string | null | undefined, dueDate: string | null): string {
  if (status === "done") return "done";
  if (!dueDate) return "none";
  return "date";
}

/** ממפה שורת DB שהוחזרה מ-INSERT לפורמט AppTask */
export function mapDbTaskRowToApp(row: DbTaskRow, ctx: SupabaseTasksReadContext): AppTask {
  const dueDate = row.due_date || null;
  return {
    id: String(row.id),
    title: row.title || "",
    notes: row.notes || "",
    status: (row.status === "done" ? "done" : "progress") as AppTask["status"],
    priority: (row.priority === "high" ? "high" : "normal") as AppTask["priority"],
    category: ctx.categorySlugById.get(row.category_id || "") || "office",
    owner: ctx.profileNameById.get(row.assignee_id || "") || "לא ידוע",
    due_date: dueDate,
    due: deriveTaskDue(row.status, dueDate),
    reminder: row.reminder || { enabled: false },
    created_at: toDateOnly(row.created_at),
    completed_at: toDateOnly(row.completed_at),
    deleted_at: null,
    deleted_by: row.deleted_by ? ctx.profileNameById.get(row.deleted_by) || null : null,
    updates: []
  };
}
