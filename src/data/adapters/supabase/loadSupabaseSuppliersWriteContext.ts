import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_ORGANIZATION_ID, NO_SUPABASE_AUTH_SESSION_REASON } from "./constants.js";
import { buildProfileIdByName, buildProfileNameById } from "./profileMaps.js";
import type { SupplierWriteContextResult } from "../../types/supabaseSupplierContext.js";

/** טוען הקשר כתיבה להזמנות ספק */
export async function loadSupabaseSuppliersWriteContext(
  client: SupabaseClient | null
): Promise<SupplierWriteContextResult> {
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
    const membersResult = await client
      .schema("bat_ayin")
      .from("organization_members")
      .select("user_id, role, is_active")
      .eq("organization_id", DEFAULT_ORGANIZATION_ID)
      .eq("is_active", true);
    if (membersResult.error) {
      return {
        ok: false,
        reason: membersResult.error.message || String(membersResult.error),
        code: "members_load_failed",
        error: membersResult.error
      };
    }
    const members = membersResult.data || [];
    const currentMember = members.find((row) => row.user_id === authUserId);
    if (!currentMember) {
      return {
        ok: false,
        reason: "Signed-in user is not an active member of this organization.",
        code: "not_org_member"
      };
    }
    const userIds = [...new Set(members.map((row) => row.user_id))];
    let profileRows: { id: string; display_name: string }[] = [];
    if (userIds.length) {
      const profilesResult = await client.from("profiles").select("id, display_name").in("id", userIds);
      if (profilesResult.error) {
        return {
          ok: false,
          reason: profilesResult.error.message || String(profilesResult.error),
          code: "profiles_load_failed",
          error: profilesResult.error
        };
      }
      profileRows = profilesResult.data || [];
    }
    const profileIdByName = buildProfileIdByName(profileRows);
    return {
      ok: true,
      ctx: {
        organizationId: DEFAULT_ORGANIZATION_ID,
        authUserId,
        authUserRole: currentMember.role === "manager" ? "manager" : "user",
        profileIdByName,
        profileNameById: buildProfileNameById(profileRows),
        allowedAssigneeIds: new Set(userIds)
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, reason: message, code: "unexpected_error", error };
  }
}
