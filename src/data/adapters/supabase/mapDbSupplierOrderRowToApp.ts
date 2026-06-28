import type { AppSupplier } from "../../types/appSupplier.js";
import type { SupabaseSuppliersReadContext } from "./loadSupabaseSuppliersReadContext.js";
import { mapDbRowToSupplierSteps } from "./supplierStepMaps.js";
import { toIsoDateOnly } from "../../shared/dateUtils.js";

type DbSupplierOrderRow = Record<string, unknown>;

/** DB row + links → AppSupplier */
export function mapDbSupplierOrderRowToApp(
  row: DbSupplierOrderRow,
  ctx: SupabaseSuppliersReadContext,
  links: string[] = []
): AppSupplier {
  const { steps, step_dates } = mapDbRowToSupplierSteps(row);
  const assigneeIds = Array.isArray(row.assignee_ids) ? (row.assignee_ids as string[]) : [];
  const assignees = row.all_assignees
    ? []
    : assigneeIds
        .map((id) => ctx.profileNameById.get(id))
        .filter((name): name is string => Boolean(name));
  const deletedById = typeof row.deleted_by === "string" ? row.deleted_by : null;
  return {
    id: String(row.id),
    supplier: String(row.supplier_name ?? "ספק ללא שם"),
    description: String(row.description ?? ""),
    amount: String(row.amount_text ?? ""),
    due_date: toIsoDateOnly(typeof row.due_date === "string" ? row.due_date : null) ?? "",
    notes: String(row.notes ?? ""),
    document_notes: String(row.document_notes ?? ""),
    links: links.filter(Boolean),
    assignees,
    allAssignees: Boolean(row.all_assignees),
    steps,
    step_dates,
    created_at: toIsoDateOnly(typeof row.created_at === "string" ? row.created_at : null) ?? "",
    deleted_at: row.deleted_at ? toIsoDateOnly(String(row.deleted_at)) : null,
    deleted_by: deletedById ? ctx.profileNameById.get(deletedById) ?? null : null
  };
}
