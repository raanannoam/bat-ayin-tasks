import { BASE_PEOPLE } from "../../catalog/basePeople.js";
import type { AppOrgMember, OrgMemberActionResult } from "../../types/appOrgMember.js";
import {
  canDeactivateMember,
  canDemoteMember,
  canPromoteMember,
  canReactivateMember,
  lastManagerBlockReason
} from "../../../domain/organization/orgMemberPermissions.js";
import { findOrgMember, sortOrgMembers } from "../../../domain/organization/orgMemberFilters.js";
import type { AccessContext } from "../../../domain/shared/appRoles.js";

function starterMembers(): AppOrgMember[] {
  const roles: Record<string, "manager" | "user"> = {
    צבי: "manager",
    עדינה: "user",
    אבי: "user",
    חיה: "user"
  };

  return BASE_PEOPLE.map((name, index) => ({
    userId: `local-member-${index + 1}`,
    displayName: name,
    email: `${name}@example.com`,
    role: roles[name] || "user",
    isActive: true,
    firstLoginAt: "2024-01-01T00:00:00.000Z",
    lastActivityAt: "2024-06-01T00:00:00.000Z",
    memberSince: "2024-01-01T00:00:00.000Z"
  }));
}

function actionError(code: string, reason: string): OrgMemberActionResult {
  return { ok: false, code, reason };
}

/** adapter מקומי לבדיקות — parity עם Supabase */
export type LocalOrgMembersAdapter = {
  loadOrgMembers(): AppOrgMember[];
  promoteMember(members: AppOrgMember[], userId: string, ctx: AccessContext): OrgMemberActionResult;
  demoteMember(members: AppOrgMember[], userId: string, ctx: AccessContext): OrgMemberActionResult;
  deactivateMember(members: AppOrgMember[], userId: string, ctx: AccessContext): OrgMemberActionResult;
  reactivateMember(members: AppOrgMember[], userId: string, ctx: AccessContext): OrgMemberActionResult;
  prepareInvitation(email: string): { ok: true; invitationId: string };
};

export function createLocalOrgMembersAdapter(): LocalOrgMembersAdapter {
  return {
    loadOrgMembers() {
      return sortOrgMembers(starterMembers());
    },
    promoteMember(members, userId, ctx) {
      const member = findOrgMember(members, userId);
      if (!canPromoteMember(ctx, member)) {
        return actionError("forbidden", "אין הרשאה לקדם.");
      }
      return {
        ok: true,
        members: members.map((row) =>
          row.userId === userId ? { ...row, role: "manager" } : row
        )
      };
    },
    demoteMember(members, userId, ctx) {
      const member = findOrgMember(members, userId);
      if (!canDemoteMember(ctx, members, member)) {
        if (member?.role === "manager") {
          return actionError("last_manager", lastManagerBlockReason("demote"));
        }
        return actionError("forbidden", "אין הרשאה להוריד תפקיד.");
      }
      return {
        ok: true,
        members: members.map((row) =>
          row.userId === userId ? { ...row, role: "user" } : row
        )
      };
    },
    deactivateMember(members, userId, ctx) {
      const member = findOrgMember(members, userId);
      if (!canDeactivateMember(ctx, members, member)) {
        if (member?.role === "manager") {
          return actionError("last_manager", lastManagerBlockReason("deactivate"));
        }
        return actionError("forbidden", "אין הרשאה להשבית.");
      }
      return {
        ok: true,
        members: members.map((row) =>
          row.userId === userId ? { ...row, isActive: false } : row
        )
      };
    },
    reactivateMember(members, userId, ctx) {
      const member = findOrgMember(members, userId);
      if (!canReactivateMember(ctx, member)) {
        return actionError("forbidden", "אין הרשאה להפעיל.");
      }
      return {
        ok: true,
        members: members.map((row) =>
          row.userId === userId ? { ...row, isActive: true } : row
        )
      };
    },
    prepareInvitation(email) {
      return { ok: true, invitationId: `local-invite-${email.trim().toLowerCase()}` };
    }
  };
}
