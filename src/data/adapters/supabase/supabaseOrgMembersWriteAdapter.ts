import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppOrgMember, OrgMemberActionResult } from "../../types/appOrgMember.js";
import {
  canDemoteMember,
  canPromoteMember,
  canDeactivateMember,
  canReactivateMember,
  lastManagerBlockReason
} from "../../../domain/organization/orgMemberPermissions.js";
import { findOrgMember } from "../../../domain/organization/orgMemberFilters.js";
import type { AccessContext } from "../../../domain/shared/appRoles.js";
import { loadSupabaseOrgMembersWriteContext } from "./loadSupabaseOrgMembersWriteContext.js";
import { createSupabaseOrgMembersReadAdapter } from "./supabaseOrgMembersReadAdapter.js";

function actionError(code: string, reason: string): OrgMemberActionResult {
  return { ok: false, code, reason };
}

function inviteError(code: string, reason: string): { ok: false; code: string; reason: string } {
  return { ok: false, code, reason };
}

/** יוצר adapter כתיבה לניהול חברי ארגון */
export function createSupabaseOrgMembersWriteAdapter(client: SupabaseClient | null) {
  const readAdapter = createSupabaseOrgMembersReadAdapter(client);

  async function reloadMembers(): Promise<AppOrgMember[]> {
    return readAdapter.loadOrgMembers();
  }

  return {
    async promoteMember(
      members: AppOrgMember[],
      userId: string,
      ctx: AccessContext
    ): Promise<OrgMemberActionResult> {
      if (!client) return actionError("supabase_not_configured", "Supabase is not configured.");
      const member = findOrgMember(members, userId);
      if (!canPromoteMember(ctx, member)) {
        return actionError("forbidden", "אין הרשאה לקדם חבר זה.");
      }

      const contextResult = await loadSupabaseOrgMembersWriteContext(client);
      if (!contextResult.ok) {
        return actionError(contextResult.code || "context_failed", contextResult.reason || "Context failed.");
      }

      const batAyin = client.schema("bat_ayin");
      const { error } = await batAyin.rpc("update_organization_member_role", {
        p_organization_id: contextResult.ctx.organizationId,
        p_user_id: userId,
        p_new_role: "manager"
      });
      if (error) {
        return actionError("rpc_failed", error.message || String(error));
      }

      return { ok: true, members: await reloadMembers() };
    },

    async demoteMember(
      members: AppOrgMember[],
      userId: string,
      ctx: AccessContext
    ): Promise<OrgMemberActionResult> {
      if (!client) return actionError("supabase_not_configured", "Supabase is not configured.");
      const member = findOrgMember(members, userId);
      if (!canDemoteMember(ctx, members, member)) {
        if (member && member.role === "manager") {
          return actionError("last_manager", lastManagerBlockReason("demote"));
        }
        return actionError("forbidden", "אין הרשאה להוריד תפקיד לחבר זה.");
      }

      const contextResult = await loadSupabaseOrgMembersWriteContext(client);
      if (!contextResult.ok) {
        return actionError(contextResult.code || "context_failed", contextResult.reason || "Context failed.");
      }

      const batAyin = client.schema("bat_ayin");
      const { error } = await batAyin.rpc("update_organization_member_role", {
        p_organization_id: contextResult.ctx.organizationId,
        p_user_id: userId,
        p_new_role: "user"
      });
      if (error) {
        const message = error.message || String(error);
        if (message.includes("last active manager")) {
          return actionError("last_manager", lastManagerBlockReason("demote"));
        }
        return actionError("rpc_failed", message);
      }

      return { ok: true, members: await reloadMembers() };
    },

    async deactivateMember(
      members: AppOrgMember[],
      userId: string,
      ctx: AccessContext
    ): Promise<OrgMemberActionResult> {
      if (!client) return actionError("supabase_not_configured", "Supabase is not configured.");
      const member = findOrgMember(members, userId);
      if (!canDeactivateMember(ctx, members, member)) {
        if (member?.role === "manager") {
          return actionError("last_manager", lastManagerBlockReason("deactivate"));
        }
        return actionError("forbidden", "אין הרשאה להשבית חבר זה.");
      }

      const contextResult = await loadSupabaseOrgMembersWriteContext(client);
      if (!contextResult.ok) {
        return actionError(contextResult.code || "context_failed", contextResult.reason || "Context failed.");
      }

      const batAyin = client.schema("bat_ayin");
      const { error } = await batAyin.rpc("set_organization_member_active", {
        p_organization_id: contextResult.ctx.organizationId,
        p_user_id: userId,
        p_is_active: false
      });
      if (error) {
        const message = error.message || String(error);
        if (message.includes("last active manager")) {
          return actionError("last_manager", lastManagerBlockReason("deactivate"));
        }
        return actionError("rpc_failed", message);
      }

      return { ok: true, members: await reloadMembers() };
    },

    async reactivateMember(
      members: AppOrgMember[],
      userId: string,
      ctx: AccessContext
    ): Promise<OrgMemberActionResult> {
      if (!client) return actionError("supabase_not_configured", "Supabase is not configured.");
      const member = findOrgMember(members, userId);
      if (!canReactivateMember(ctx, member)) {
        return actionError("forbidden", "אין הרשאה להפעיל חבר זה.");
      }

      const contextResult = await loadSupabaseOrgMembersWriteContext(client);
      if (!contextResult.ok) {
        return actionError(contextResult.code || "context_failed", contextResult.reason || "Context failed.");
      }

      const batAyin = client.schema("bat_ayin");
      const { error } = await batAyin.rpc("set_organization_member_active", {
        p_organization_id: contextResult.ctx.organizationId,
        p_user_id: userId,
        p_is_active: true
      });
      if (error) {
        return actionError("rpc_failed", error.message || String(error));
      }

      return { ok: true, members: await reloadMembers() };
    },

    async prepareInvitation(
      email: string,
      role: "manager" | "user" = "user"
    ): Promise<{ ok: true; invitationId: string } | { ok: false; code: string; reason: string }> {
      if (!client) return inviteError("supabase_not_configured", "Supabase is not configured.");
      const contextResult = await loadSupabaseOrgMembersWriteContext(client);
      if (!contextResult.ok) {
        return inviteError(contextResult.code || "context_failed", contextResult.reason || "Context failed.");
      }

      const batAyin = client.schema("bat_ayin");
      const { data, error } = await batAyin.rpc("prepare_organization_invitation", {
        p_organization_id: contextResult.ctx.organizationId,
        p_email: email.trim(),
        p_role: role
      });
      if (error) {
        return inviteError("rpc_failed", error.message || String(error));
      }

      return { ok: true, invitationId: String(data) };
    }
  };
}
