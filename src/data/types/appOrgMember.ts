import type { AppRole } from "../../domain/shared/appRoles.js";

/** חבר ארגון לתצוגה וניהול */
export type AppOrgMember = {
  userId: string;
  displayName: string;
  email: string;
  role: AppRole;
  isActive: boolean;
  firstLoginAt: string | null;
  lastActivityAt: string | null;
  memberSince: string | null;
};

/** תוצאת פעולת ניהול חבר */
export type OrgMemberActionResult =
  | { ok: true; members: AppOrgMember[] }
  | { ok: false; code: string; reason: string };

/** הזמנה ממתינה להצטרפות לארגון */
export type AppOrgInvitation = {
  id: string;
  email: string;
  role: AppRole;
  createdAt: string | null;
};

/** תוצאת הכנת הזמנה */
export type InvitationActionResult =
  | { ok: true; invitationId: string; invitations: AppOrgInvitation[]; reloadFailed?: boolean }
  | { ok: false; code: string; reason: string };

/** תוצאת ביטול הזמנה ממתינה */
export type CancelInvitationResult =
  | { ok: true; invitations: AppOrgInvitation[]; reloadFailed?: boolean }
  | { ok: false; code: string; reason: string };
