import type { SupabaseClient } from "@supabase/supabase-js";
import { loadSupabaseTasksWriteContext } from "../data/adapters/supabase/supabaseTasksWriteAdapter.js";
import type { CategoryItem } from "../data/catalog/baseCategories.js";
import type { AppRole } from "../domain/shared/appRoles.js";
import { ensurePilotProfile } from "./ensurePilotProfile.js";

export type PilotAuthStatus =
  | "signed_out"
  | "ready"
  | "missing_profile"
  | "not_org_member"
  | "error";

export type PilotAuthContext = {
  status: PilotAuthStatus;
  role: AppRole;
  userId: string;
  email: string;
  displayName: string;
  orgPeople: string[];
  orgCategories: CategoryItem[];
  reason?: string;
  code?: string;
};

/** טוען session + פרופיל + חברות בארגון + רשימת מבצעים */
export async function loadPilotAuthContext(
  client: SupabaseClient | null
): Promise<PilotAuthContext> {
  const empty: PilotAuthContext = {
    status: "signed_out",
    role: "user",
    userId: "",
    email: "",
    displayName: "",
    orgPeople: [],
    orgCategories: []
  };

  if (!client) {
    return { ...empty, status: "error", code: "supabase_not_configured", reason: "Supabase is not configured." };
  }

  try {
    const { data: authData, error: authError } = await client.auth.getSession();
    if (authError) {
      return { ...empty, status: "error", code: "auth_check_failed", reason: authError.message };
    }
    if (!authData.session?.user) {
      return empty;
    }

    const user = authData.session.user;
    const profileResult = await ensurePilotProfile(client, user);
    if (!profileResult.ok) {
      const status = profileResult.code === "profile_create_failed" ? "missing_profile" : "error";
      return {
        ...empty,
        status,
        userId: user.id,
        email: user.email || "",
        code: profileResult.code,
        reason: profileResult.reason
      };
    }

    const ctxResult = await loadSupabaseTasksWriteContext(client);
    if (!ctxResult.ok) {
      const status = ctxResult.code === "not_org_member" ? "not_org_member" : "error";
      return {
        ...empty,
        status,
        userId: user.id,
        email: user.email || "",
        displayName: profileResult.profile.display_name,
        code: ctxResult.code,
        reason: ctxResult.reason
      };
    }

    const orgPeople = [...ctxResult.ctx.profileIdByName.keys()].sort((a, b) => a.localeCompare(b, "he"));
    const orgCategories: CategoryItem[] = ctxResult.ctx.categoryCatalog.map((row) => ({
      id: row.id,
      label: row.label,
      icon: row.icon
    }));
    // שם תצוגה זהה למפת assignee_id — כמו ב-task.owner
    const displayName =
      ctxResult.ctx.profileNameById.get(user.id) || profileResult.profile.display_name || "";

    return {
      status: "ready",
      role: ctxResult.ctx.authUserRole,
      userId: user.id,
      email: user.email || profileResult.profile.email,
      displayName,
      orgPeople,
      orgCategories
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ...empty, status: "error", code: "unexpected_error", reason: message };
  }
}
