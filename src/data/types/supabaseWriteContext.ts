/** קטגוריה לתצוגה באפליקציה — מקור: bat_ayin.categories */
export type SupabaseOrgCategory = {
  id: string;
  label: string;
  icon: string;
};

/** הקשר כתיבה ל-Supabase — נטען לפני INSERT */
export type SupabaseTasksWriteContext = {
  organizationId: string;
  authUserId: string;
  authUserRole: "manager" | "user";
  categoryIdBySlug: Map<string, string>;
  categoryCatalog: SupabaseOrgCategory[];
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

export type SupabaseTaskUpdatePayload = {
  title?: string;
  notes?: string;
  status?: "progress" | "done";
  priority?: "normal" | "high";
  due_date?: string | null;
  due_label?: string | null;
  reminder?: { enabled: boolean; timing?: string; amount?: number; unit?: string };
  category_id?: string | null;
  assignee_id?: string;
  completed_at?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
};

export type MapUpdateResult =
  | { ok: true; payload: SupabaseTaskUpdatePayload }
  | { ok: false; reason?: string; code?: string };
