import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_ORGANIZATION_ID, NO_SUPABASE_AUTH_SESSION_REASON } from "./constants.js";
import {
  buildCategoryIdBySlug,
  buildProfileIdByName,
  buildProfileNameById
} from "./profileMaps.js";
import type { WriteContextResult } from "../../types/supabaseWriteContext.js";

/** טוען הקשר כתיבה: auth, קטגוריות, חברי ארגון, פרופילים */
export async function loadSupabaseTasksWriteContext(
  client: SupabaseClient | null
): Promise<WriteContextResult> {
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
    const batAyin = client.schema("bat_ayin");
    const [categoriesResult, membersResult] = await Promise.all([
      batAyin
        .from("categories")
        .select("id, slug")
        .eq("organization_id", DEFAULT_ORGANIZATION_ID)
        .eq("is_active", true)
        .is("deleted_at", null),
      batAyin
        .from("organization_members")
        .select("user_id, role, is_active")
        .eq("organization_id", DEFAULT_ORGANIZATION_ID)
        .eq("is_active", true)
    ]);
    if (categoriesResult.error) {
      return {
        ok: false,
        reason: categoriesResult.error.message || String(categoriesResult.error),
        code: "categories_load_failed",
        error: categoriesResult.error
      };
    }
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
        categoryIdBySlug: buildCategoryIdBySlug(categoriesResult.data),
        profileIdByName,
        profileNameById: buildProfileNameById(profileRows),
        allowedAssigneeIds: new Set(userIds),
        allowedOwnerNames: new Set(profileIdByName.keys())
      }
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, reason: message, code: "unexpected_error", error };
  }
}
