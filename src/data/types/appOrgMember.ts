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
