/** הקשר כתיבה להזמנות ספק */
export type SupabaseSuppliersWriteContext = {
  organizationId: string;
  authUserId: string;
  authUserRole: "manager" | "user";
  profileIdByName: Map<string, string>;
  profileNameById: Map<string, string>;
  allowedAssigneeIds: Set<string>;
};

export type SupabaseSupplierOrderInsertPayload = {
  organization_id: string;
  supplier_id: null;
  created_by: string;
  supplier_name: string;
  description: string;
  amount_text: string;
  due_date: string | null;
  notes: string;
  document_notes: string;
  all_assignees: boolean;
  assignee_ids: string[];
  order_completed: boolean;
  order_completed_at: string | null;
  received_completed: boolean;
  received_completed_at: string | null;
  payment_completed: boolean;
  payment_completed_at: string | null;
  invoice_completed: boolean;
  invoice_completed_at: string | null;
};

export type SupplierWriteContextResult =
  | { ok: true; ctx: SupabaseSuppliersWriteContext }
  | { ok: false; reason?: string; code?: string; error?: unknown };

export type SupplierMapInsertResult =
  | { ok: true; payload: SupabaseSupplierOrderInsertPayload; links: string[] }
  | { ok: false; reason?: string; code?: string };

export type SupplierMapUpdateResult =
  | { ok: true; payload: Record<string, unknown> }
  | { ok: false; reason?: string; code?: string };
