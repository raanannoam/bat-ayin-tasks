import type { AppSupplier } from "../../types/appSupplier.js";
import type {
  SupplierMapInsertResult,
  SupabaseSupplierOrderInsertPayload,
  SupabaseSuppliersWriteContext
} from "../../types/supabaseSupplierContext.js";
import { mapSupplierStepsToDb } from "./supplierStepMaps.js";
import { toIsoDateOnly } from "../../shared/dateUtils.js";

/** ממפה assignees ל-assignee_ids */
function mapAssigneesToDb(app: AppSupplier, writeCtx: SupabaseSuppliersWriteContext) {
  if (app.allAssignees) {
    return { ok: true as const, all_assignees: true, assignee_ids: [] as string[] };
  }
  const assigneeIds: string[] = [];
  for (const name of app.assignees || []) {
    const trimmed = String(name).trim();
    const profileId = writeCtx.profileIdByName.get(trimmed);
    if (!profileId) {
      return {
        ok: false as const,
        code: "assignee_not_found",
        reason: `Assignee "${trimmed}" does not exist in Supabase member map.`
      };
    }
    if (!writeCtx.allowedAssigneeIds.has(profileId)) {
      return { ok: false as const, code: "assignee_not_allowed" };
    }
    assigneeIds.push(profileId);
  }
  if (!assigneeIds.length) {
    return {
      ok: false as const,
      code: "assignees_missing",
      reason: "At least one assignee is required when allAssignees is false."
    };
  }
  return { ok: true as const, all_assignees: false, assignee_ids: assigneeIds };
}

/** ממפה AppSupplier → INSERT payload + links */
export function mapAppSupplierOrderToInsert(
  app: AppSupplier,
  writeCtx: SupabaseSuppliersWriteContext
): SupplierMapInsertResult {
  const supplierName = String(app.supplier ?? "").trim();
  if (!supplierName) {
    return { ok: false, code: "supplier_name_missing" };
  }
  const assigneeResult = mapAssigneesToDb(app, writeCtx);
  if (!assigneeResult.ok) {
    return { ok: false, code: assigneeResult.code, reason: assigneeResult.reason };
  }
  return {
    ok: true,
    links: (app.links || []).filter(Boolean),
    payload: {
      organization_id: writeCtx.organizationId,
      supplier_id: null,
      created_by: writeCtx.authUserId,
      supplier_name: supplierName,
      description: app.description ?? "",
      amount_text: app.amount ?? "",
      due_date: toIsoDateOnly(app.due_date) ?? null,
      notes: app.notes ?? "",
      document_notes: app.document_notes ?? "",
      all_assignees: assigneeResult.all_assignees,
      assignee_ids: assigneeResult.assignee_ids,
      ...mapSupplierStepsToDb(app.steps, app.step_dates)
    }
  };
}

/** ממפה AppSupplier מלא → UPDATE payload */
export function mapAppSupplierToSupabaseUpdate(
  app: AppSupplier,
  writeCtx: SupabaseSuppliersWriteContext
) {
  const assigneeResult = mapAssigneesToDb(app, writeCtx);
  if (!assigneeResult.ok) {
    return { ok: false as const, code: assigneeResult.code, reason: assigneeResult.reason };
  }
  return {
    ok: true as const,
    payload: {
      supplier_name: String(app.supplier ?? "").trim(),
      description: app.description ?? "",
      amount_text: app.amount ?? "",
      due_date: toIsoDateOnly(app.due_date) ?? null,
      notes: app.notes ?? "",
      document_notes: app.document_notes ?? "",
      all_assignees: assigneeResult.all_assignees,
      assignee_ids: assigneeResult.assignee_ids,
      ...mapSupplierStepsToDb(app.steps, app.step_dates)
    },
    links: (app.links || []).filter(Boolean)
  };
}
