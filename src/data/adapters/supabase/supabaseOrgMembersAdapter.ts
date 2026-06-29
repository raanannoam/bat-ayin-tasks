import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppOrgMember, OrgMemberActionResult } from "../../types/appOrgMember.js";
import type { AccessContext } from "../../../domain/shared/appRoles.js";
import { createSupabaseOrgMembersReadAdapter } from "./supabaseOrgMembersReadAdapter.js";
import { createSupabaseOrgMembersWriteAdapter } from "./supabaseOrgMembersWriteAdapter.js";

/** חוזה adapter חברי ארגון */
export type SupabaseOrgMembersAdapter = {
  loadOrgMembers(): Promise<AppOrgMember[]>;
  promoteMember(
    members: AppOrgMember[],
    userId: string,
    ctx: AccessContext
  ): Promise<OrgMemberActionResult>;
  demoteMember(
    members: AppOrgMember[],
    userId: string,
    ctx: AccessContext
  ): Promise<OrgMemberActionResult>;
  deactivateMember(
    members: AppOrgMember[],
    userId: string,
    ctx: AccessContext
  ): Promise<OrgMemberActionResult>;
  reactivateMember(
    members: AppOrgMember[],
    userId: string,
    ctx: AccessContext
  ): Promise<OrgMemberActionResult>;
  prepareInvitation(
    email: string,
    role?: "manager" | "user"
  ): Promise<{ ok: true; invitationId: string } | { ok: false; code: string; reason: string }>;
};

/** adapter מאוחד — read + write */
export function createSupabaseOrgMembersAdapter(
  client: SupabaseClient | null
): SupabaseOrgMembersAdapter {
  const readAdapter = createSupabaseOrgMembersReadAdapter(client);
  const writeAdapter = createSupabaseOrgMembersWriteAdapter(client);

  return {
    loadOrgMembers() {
      return readAdapter.loadOrgMembers();
    },
    promoteMember(members, userId, ctx) {
      return writeAdapter.promoteMember(members, userId, ctx);
    },
    demoteMember(members, userId, ctx) {
      return writeAdapter.demoteMember(members, userId, ctx);
    },
    deactivateMember(members, userId, ctx) {
      return writeAdapter.deactivateMember(members, userId, ctx);
    },
    reactivateMember(members, userId, ctx) {
      return writeAdapter.reactivateMember(members, userId, ctx);
    },
    prepareInvitation(email, role) {
      return writeAdapter.prepareInvitation(email, role);
    }
  };
}
