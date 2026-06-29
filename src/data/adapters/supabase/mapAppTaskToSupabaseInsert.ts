import type { AppTask } from "../../types/appTask.js";
import type { MapInsertResult, SupabaseTasksWriteContext } from "../../types/supabaseWriteContext.js";

/** ממפה משימת אפליקציה ל-payload INSERT ב-bat_ayin.tasks */
export function mapAppTaskToSupabaseInsert(
  appTask: AppTask,
  writeCtx: SupabaseTasksWriteContext
): MapInsertResult {
  const title = String(appTask?.title ?? "").trim();
  if (!title) {
    return { ok: false, code: "title_missing" };
  }
  const owner = appTask?.owner;
  if (owner == null || String(owner).trim() === "") {
    return { ok: false, code: "owner_missing", reason: "Task owner is required." };
  }
  const ownerName = String(owner).trim();
  const assigneeId = writeCtx.profileIdByName.get(ownerName);
  if (!assigneeId) {
    return {
      ok: false,
      code: "owner_not_found",
      reason: "Owner name does not exist in Supabase member map."
    };
  }
  if (!writeCtx.allowedAssigneeIds.has(assigneeId)) {
    return { ok: false, code: "owner_not_allowed" };
  }
  const category = appTask?.category;
  let categoryId: string | null = null;
  if (category && category !== "uncategorized") {
    // קטגוריה מקומית שאין ב-Supabase — משימה בלי קטגוריה (לא שגיאה)
    categoryId = writeCtx.categoryIdBySlug.get(category) ?? null;
  }
  const dueDate = appTask?.dueDate ?? appTask?.due_date ?? null;
  const dueLabel = appTask?.dueLabel ?? null;
  return {
    ok: true,
    payload: {
      organization_id: writeCtx.organizationId,
      category_id: categoryId,
      assignee_id: assigneeId,
      created_by: writeCtx.authUserId,
      title,
      notes: appTask?.notes ?? "",
      status: appTask?.status === "done" ? "done" : "progress",
      priority: appTask?.priority === "high" ? "high" : "normal",
      due_date: dueDate,
      due_label: dueLabel,
      reminder: appTask?.reminder ?? { enabled: false }
    }
  };
}
