import type { AppOrgInvitation, AppOrgMember } from "../../data/types/appOrgMember.js";

/** מיון חברי ארגון לפי שם */
export function sortOrgMembers(members: AppOrgMember[]): AppOrgMember[] {
  return [...members].sort((a, b) => a.displayName.localeCompare(b.displayName, "he"));
}

/** חיפוש חבר לפי מזהה */
export function findOrgMember(
  members: AppOrgMember[],
  userId: string
): AppOrgMember | undefined {
  return members.find((member) => member.userId === userId);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** בדיקת תקינות אימייל בסיסית להזמנת חבר */
export function isValidInvitationEmail(email: string): boolean {
  return EMAIL_PATTERN.test(email.trim());
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/** חיפוש חבר פעיל לפי אימייל (נרמול רישיות ורווחים) */
export function findActiveMemberByEmail(
  members: AppOrgMember[],
  email: string
): AppOrgMember | undefined {
  const normalized = normalizeEmail(email);
  return members.find((member) => member.isActive && normalizeEmail(member.email) === normalized);
}

/** חיפוש הזמנה ממתינה לפי אימייל (נרמול רישיות ורווחים) */
export function findPendingInvitation(
  invitations: AppOrgInvitation[],
  email: string
): AppOrgInvitation | undefined {
  const normalized = normalizeEmail(email);
  return invitations.find((invitation) => normalizeEmail(invitation.email) === normalized);
}
