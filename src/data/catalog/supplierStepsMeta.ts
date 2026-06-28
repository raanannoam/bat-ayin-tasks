import type { SupplierStepId } from "../types/appSupplier.js";

/** תוויות שלבי ספק ל-UI — תואם SUPPLIER_STEP_IDS */
export type SupplierStepMeta = {
  id: SupplierStepId;
  label: string;
};

export const SUPPLIER_STEPS: SupplierStepMeta[] = [
  { id: "order", label: "הזמנה" },
  { id: "received", label: "קבלה" },
  { id: "payment", label: "תשלום" },
  { id: "invoice", label: "קבלת חשבונית" }
];
