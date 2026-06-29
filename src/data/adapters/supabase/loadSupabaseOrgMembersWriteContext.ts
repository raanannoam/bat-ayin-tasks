import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_ORGANIZATION_ID, NO_SUPABASE_AUTH_SESSION_REASON } from "./constants.js";

export type OrgMembersWriteContext = {
  organizationId: string;
  authUserId: string;
  authUserRole: "manager" | "user";
};

export type OrgMembersWriteContextResult =
  | { ok: true; ctx: OrgMembersWriteContext }
  | { ok: false; reason?: string; code?: string; error?: unknown };

/** טוען הקשר כתיבה לניהול חברי ארגון */
export async function loadSupabaseOrgMembersWriteContext(
  client: SupabaseClient | null
): Promise<OrgMembersWriteContextResult> {
  try {
    if (!client) {
      return { ok: false, reason: "Supabase is not configured.", code: "supabase_not_configured" };
    }

    const { data: authData, error: authError } = await client.auth.getSession();
    if (authError) {
      return {
        ok: false,
        reason: authError.message || "Auth check failed.",
        code: "auth_check_failed",
        error: authError
      };
    }
    if (!authData.session) {
      return { ok: false, reason: NO_SUPABASE_AUTH_SESSION_REASON, code: "auth_session_missing" };
    }

    const authUserId = authData.session.user.id;
    const { data: memberRow, error: memberError } = await client
      .schema("bat_ayin")
      .from("organization_members")
      .select("role, is_active")
      .eq("organization_id", DEFAULT_ORGANIZATION_ID)
      .eq("user_id", authUserId)
      .maybeSingle();

    if (memberError) {
      return {
        ok: false,
        reason: memberError.message || String(memberError),
        code: "membership_load_failed",
        error: memberError
      };
    }
    if (!memberRow?.is_active) {
      return {
        ok: false,
        reason: "Signed-in user is not an active member of this organization.",
        code: "not_org_member"
      };
    }
    if (memberRow.role !== "manager") {
      return {
        ok: false,
        reason: "Only managers can administer organization members.",
        code: "not_org_manager"
      };
    }

    return {
      ok: true,
      ctx: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        authUserId,
        authUserRole: "manager"
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, reason: message, code: "unexpected_error", error };
  }
}
