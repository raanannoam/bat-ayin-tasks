import type { AppOrgMember } from "../../data/types/appOrgMember.js";

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
