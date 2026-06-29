import type { AccessContext, AppRole } from "../shared/appRoles.js";
import type { AppOrgMember } from "../../data/types/appOrgMember.js";

/** רק מנהל יכול לגשת לניהול ארגון */
export function canAccessOrgAdmin(ctx: AccessContext): boolean {
  return ctx.role === "manager";
}

/** ספירת מנהלים פעילים */
export function countActiveManagers(members: AppOrgMember[]): number {
  return members.filter((member) => member.role === "manager" && member.isActive).length;
}

/** האם חבר הוא המנהל הפעיל האחרון */
export function isLastActiveManager(members: AppOrgMember[], targetUserId: string): boolean {
  const target = members.find((member) => member.userId === targetUserId);
  if (!target || target.role !== "manager" || !target.isActive) return false;
  return countActiveManagers(members) <= 1;
}

/** הודעת חסימה כשמנסים לשנות את המנהל האחרון */
export function lastManagerBlockReason(action: "demote" | "deactivate"): string {
  if (action === "demote") {
    return "לא ניתן להוריד לתפקיד משתמש את המנהל הפעיל האחרון בארגון.";
  }
  return "לא ניתן להשבית את המנהל הפעיל האחרון בארגון.";
}

/** האם מותר לקדם משתמש למנהל */
export function canPromoteMember(ctx: AccessContext, member: AppOrgMember | null | undefined): boolean {
  if (!canAccessOrgAdmin(ctx) || !member) return false;
  return member.isActive && member.role === "user";
}

/** האם מותר להוריד מנהל למשתמש */
export function canDemoteMember(
  ctx: AccessContext,
  members: AppOrgMember[],
  member: AppOrgMember | null | undefined
): boolean {
  if (!canAccessOrgAdmin(ctx) || !member) return false;
  if (!member.isActive || member.role !== "manager") return false;
  return !isLastActiveManager(members, member.userId);
}

/** האם מותר להשבית חבר */
export function canDeactivateMember(
  ctx: AccessContext,
  members: AppOrgMember[],
  member: AppOrgMember | null | undefined
): boolean {
  if (!canAccessOrgAdmin(ctx) || !member || !member.isActive) return false;
  if (member.role === "manager" && isLastActiveManager(members, member.userId)) return false;
  return true;
}

/** האם מותר להפעיל חבר מחדש */
export function canReactivateMember(
  ctx: AccessContext,
  member: AppOrgMember | null | undefined
): boolean {
  if (!canAccessOrgAdmin(ctx) || !member) return false;
  return !member.isActive;
}

/** תווית תפקיד בעברית */
export function orgMemberRoleLabel(role: AppRole): string {
  return role === "manager" ? "מנהל" : "משתמש";
}
