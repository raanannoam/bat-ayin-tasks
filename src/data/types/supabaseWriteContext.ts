/** הקשר כתיבה ל-Supabase — נטען לפני INSERT */
export type SupabaseTasksWriteContext = {
  organizationId: string;
  authUserId: string;
  authUserRole: "manager" | "user";
  categoryIdBySlug: Map<string, string>;
  profileIdByName: Map<string, string>;
  profileNameById: Map<string, string>;
  allowedAssigneeIds: Set<string>;
  allowedOwnerNames: Set<string>;
};

export type SupabaseTaskInsertPayload = {
  organization_id: string;
  category_id: string | null;
  assignee_id: string;
  created_by: string;
  title: string;
  notes: string;
  status: "progress" | "done";
  priority: "normal" | "high";
  due_date: string | null;
  due_label: string | null;
  reminder: { enabled: boolean; timing?: string; amount?: number; unit?: string };
};

export type WriteContextResult =
  | { ok: true; ctx: SupabaseTasksWriteContext }
  | { ok: false; reason?: string; code?: string; error?: unknown };

export type MapInsertResult =
  | { ok: true; payload: SupabaseTaskInsertPayload }
  | { ok: false; reason?: string; code?: string };
