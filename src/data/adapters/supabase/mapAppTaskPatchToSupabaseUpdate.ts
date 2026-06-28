import type { AppTask } from "../../types/appTask.js";
import type { MapUpdateResult, SupabaseTaskUpdatePayload } from "../../types/supabaseWriteContext.js";
import { isoDateFromOffset, toIsoDateOnly } from "../../shared/dateUtils.js";
import type { SupabaseTasksWriteContext } from "../../types/supabaseWriteContext.js";

/** ממיר תאריך אפליקציה ל-timestamptz ל-DB */
function toDbTimestamp(value: string | null | undefined): string | null {
  const dateOnly = toIsoDateOnly(value);
  if (!dateOnly) return null;
  return `${dateOnly}T12:00:00.000Z`;
}

/** ממפה patch של משימה לעדכון Supabase — רק שדות שנשלחו */
export function mapAppTaskPatchToSupabaseUpdate(
  patch: Partial<AppTask>,
  writeCtx: SupabaseTasksWriteContext
): MapUpdateResult {
  const payload: SupabaseTaskUpdatePayload = {};

  if ("title" in patch) {
    payload.title = String(patch.title ?? "").trim();
  }
  if ("notes" in patch) {
    payload.notes = patch.notes ?? "";
  }
  if ("status" in patch) {
    payload.status = patch.status === "done" ? "done" : "progress";
  }
  if ("priority" in patch) {
    payload.priority = patch.priority === "high" ? "high" : "normal";
  }
  if ("due_date" in patch || "dueDate" in patch) {
    payload.due_date = patch.due_date ?? patch.dueDate ?? null;
  }
  if ("dueLabel" in patch) {
    payload.due_label = patch.dueLabel ?? null;
  }
  if ("reminder" in patch) {
    payload.reminder = patch.reminder ?? { enabled: false };
  }
  if ("category" in patch) {
    const category = patch.category;
    if (!category || category === "uncategorized") {
      payload.category_id = null;
    } else {
      const categoryId = writeCtx.categoryIdBySlug.get(category);
      if (!categoryId) {
        return { ok: false, code: "category_not_found" };
      }
      payload.category_id = categoryId;
    }
  }
  if ("owner" in patch) {
    const ownerName = String(patch.owner ?? "").trim();
    if (!ownerName) {
      return { ok: false, code: "owner_missing", reason: "Task owner is required." };
    }
    const assigneeId = writeCtx.profileIdByName.get(ownerName);
    if (!assigneeId) {
      return { ok: false, code: "owner_not_found", reason: "Owner name does not exist in Supabase member map." };
    }
    if (!writeCtx.allowedAssigneeIds.has(assigneeId)) {
      return { ok: false, code: "owner_not_allowed" };
    }
    payload.assignee_id = assigneeId;
  }
  if ("deleted_at" in patch) {
    payload.deleted_at = patch.deleted_at ? toDbTimestamp(patch.deleted_at) ?? toDbTimestamp(isoDateFromOffset(0)) : null;
  }
  if ("deleted_by" in patch) {
    if (!patch.deleted_by) {
      payload.deleted_by = null;
    } else {
      const deletedById = writeCtx.profileIdByName.get(String(patch.deleted_by).trim());
      if (!deletedById) {
        return { ok: false, code: "deleted_by_not_found", reason: "Deleted-by name does not exist in Supabase member map." };
      }
      payload.deleted_by = deletedById;
    }
  }
  if ("completed_at" in patch) {
    payload.completed_at = patch.completed_at ? toDbTimestamp(patch.completed_at) : null;
  }

  return { ok: true, payload };
}
