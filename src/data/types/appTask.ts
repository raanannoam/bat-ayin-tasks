/** משימה בפורמט האפליקציה */
export type AppTask = {
  id?: string;
  title?: string;
  owner?: string;
  /** assignee_id מ-Supabase — לזיהוי משימות אישיות לפי auth uid */
  assigneeId?: string;
  category?: string;
  notes?: string;
  status?: "progress" | "done";
  priority?: "normal" | "high";
  dueDate?: string | null;
  due_date?: string | null;
  dueLabel?: string | null;
  due?: string;
  reminder?: { enabled: boolean; timing?: string; amount?: number; unit?: string };
  created_at?: string | null;
  completed_at?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
  updates?: unknown[];
};
