import {
  SUPPLIER_STEP_IDS,
  type AppSupplier,
  type SupplierStepDates,
  type SupplierSteps
} from "../types/appSupplier.js";
import { isoDateFromOffset } from "./dateUtils.js";

/** מנרמל שלבי ספק — תואם supplierSteps ב-runtime */
function normalizeSupplierSteps(steps: Partial<SupplierSteps> | undefined): SupplierSteps {
  return SUPPLIER_STEP_IDS.reduce((acc, stepId) => {
    acc[stepId] = Boolean(steps?.[stepId]);
    return acc;
  }, {} as SupplierSteps);
}

/** מנרמל תאריכי שלבי ספק */
function normalizeSupplierStepDates(
  stepDates: Partial<SupplierStepDates> | undefined
): SupplierStepDates {
  return SUPPLIER_STEP_IDS.reduce((acc, stepId) => {
    acc[stepId] = stepDates?.[stepId] ? stepDates[stepId] : "";
    return acc;
  }, {} as SupplierStepDates);
}

/** מנרמל הזמנת ספק לפורמט runtime — תואם outputs/index.html */
export function normalizeSupplier(item: Partial<AppSupplier>, index = 0): AppSupplier {
  return {
    id: item.id || `s${Date.now()}-${index}`,
    supplier: item.supplier || "ספק ללא שם",
    description: item.description || "",
    amount: item.amount || "",
    due_date: item.due_date || "",
    notes: item.notes || "",
    document_notes: item.document_notes || "",
    links: Array.isArray(item.links) ? item.links : [],
    assignees: Array.isArray(item.assignees) ? item.assignees : [],
    allAssignees: Boolean(item.allAssignees),
    steps: normalizeSupplierSteps(item.steps),
    step_dates: normalizeSupplierStepDates(item.step_dates),
    created_at: item.created_at || isoDateFromOffset(-index),
    deleted_at: item.deleted_at ?? null,
    deleted_by: item.deleted_by ?? null
  };
}
