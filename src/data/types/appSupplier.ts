/** מזהי שלבי הזמנת ספק — תואם supplierSteps באפליקציה */
export const SUPPLIER_STEP_IDS = ["order", "received", "payment", "invoice"] as const;

export type SupplierStepId = (typeof SUPPLIER_STEP_IDS)[number];

export type SupplierSteps = Record<SupplierStepId, boolean>;

export type SupplierStepDates = Record<SupplierStepId, string>;

/** צורת הזמנת ספק באפליקציה — parity עם normalizeSupplier */
export type AppSupplier = {
  id: string;
  supplier: string;
  description: string;
  amount: string;
  due_date: string;
  notes: string;
  document_notes: string;
  links: string[];
  assignees: string[];
  allAssignees: boolean;
  steps: SupplierSteps;
  step_dates: SupplierStepDates;
  created_at: string;
  deleted_at?: string | null;
  deleted_by?: string | null;
};
