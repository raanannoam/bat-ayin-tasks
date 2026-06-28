import type { SupplierStepDates, SupplierStepId, SupplierSteps } from "../../types/appSupplier.js";
import { SUPPLIER_STEP_IDS } from "../../types/appSupplier.js";
import type { SupabaseSupplierOrderInsertPayload } from "../../types/supabaseSupplierContext.js";
import { isoDateFromOffset, toIsoDateOnly } from "../../shared/dateUtils.js";

type SupplierStepDbFields = Pick<
  SupabaseSupplierOrderInsertPayload,
  | "order_completed"
  | "order_completed_at"
  | "received_completed"
  | "received_completed_at"
  | "payment_completed"
  | "payment_completed_at"
  | "invoice_completed"
  | "invoice_completed_at"
>;

/** עמודות DB לכל שלב */
const STEP_DB_COLUMNS: Record<
  SupplierStepId,
  { completed: string; completedAt: string }
> = {
  order: { completed: "order_completed", completedAt: "order_completed_at" },
  received: { completed: "received_completed", completedAt: "received_completed_at" },
  payment: { completed: "payment_completed", completedAt: "payment_completed_at" },
  invoice: { completed: "invoice_completed", completedAt: "invoice_completed_at" }
};

/** timestamptz/date → YYYY-MM-DD או מחרוזת ריקה */
function dbDateToApp(value: unknown): string {
  return toIsoDateOnly(typeof value === "string" ? value : null) ?? "";
}

/** YYYY-MM-DD → date column (null אם ריק) */
function appDateToDb(value: string | null | undefined): string | null {
  return toIsoDateOnly(value) ?? null;
}

/** timestamptz ל-soft delete */
export function toDbTimestamp(value: string | null | undefined): string | null {
  const dateOnly = toIsoDateOnly(value);
  if (!dateOnly) return null;
  return `${dateOnly}T12:00:00.000Z`;
}

/** שלבים ריקים — ברירת מחדל */
export function emptySupplierSteps(): SupplierSteps {
  return SUPPLIER_STEP_IDS.reduce((acc, step) => {
    acc[step] = false;
    return acc;
  }, {} as SupplierSteps);
}

/** תאריכי שלבים ריקים */
export function emptySupplierStepDates(): SupplierStepDates {
  return SUPPLIER_STEP_IDS.reduce((acc, step) => {
    acc[step] = "";
    return acc;
  }, {} as SupplierStepDates);
}

/** DB row → steps + step_dates */
export function mapDbRowToSupplierSteps(row: Record<string, unknown>): {
  steps: SupplierSteps;
  step_dates: SupplierStepDates;
} {
  const steps = emptySupplierSteps();
  const step_dates = emptySupplierStepDates();
  for (const step of SUPPLIER_STEP_IDS) {
    const cols = STEP_DB_COLUMNS[step];
    steps[step] = Boolean(row[cols.completed]);
    step_dates[step] = dbDateToApp(row[cols.completedAt]);
  }
  return { steps, step_dates };
}

/** steps + step_dates → עמודות DB */
export function mapSupplierStepsToDb(steps: SupplierSteps, stepDates: SupplierStepDates): SupplierStepDbFields {
  return {
    order_completed: Boolean(steps.order),
    order_completed_at: appDateToDb(stepDates.order),
    received_completed: Boolean(steps.received),
    received_completed_at: appDateToDb(stepDates.received),
    payment_completed: Boolean(steps.payment),
    payment_completed_at: appDateToDb(stepDates.payment),
    invoice_completed: Boolean(steps.invoice),
    invoice_completed_at: appDateToDb(stepDates.invoice)
  };
}

/** patch לשלב בודד — parity עם updateSupplierStage */
export function buildSupplierStageUpdatePayload(
  step: string,
  checked: boolean,
  dateValue: string | null | undefined
): Record<string, boolean | string | null> | null {
  if (!SUPPLIER_STEP_IDS.includes(step as SupplierStepId)) return null;
  const cols = STEP_DB_COLUMNS[step as SupplierStepId];
  const nextChecked = dateValue ? true : checked;
  const payload: Record<string, boolean | string | null> = {
    [cols.completed]: nextChecked
  };
  if (dateValue !== null && dateValue !== undefined) {
    payload[cols.completedAt] = appDateToDb(dateValue);
  }
  return payload;
}

/** patch לסימון כל השלבים — parity עם markAllSupplierStages */
export function buildMarkAllSupplierStagesPayload(stepDates: SupplierStepDates) {
  const today = isoDateFromOffset(0);
  const steps = SUPPLIER_STEP_IDS.reduce((acc, step) => {
    acc[step] = true;
    return acc;
  }, {} as SupplierSteps);
  const nextDates = SUPPLIER_STEP_IDS.reduce((acc, step) => {
    acc[step] = stepDates[step] || today;
    return acc;
  }, {} as SupplierStepDates);
  return mapSupplierStepsToDb(steps, nextDates);
}
