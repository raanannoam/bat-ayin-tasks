import type { AppOrgMember } from "../../types/appOrgMember.js";

type DbOrgMemberRow = {
  user_id: string;
  display_name: string;
  email: string;
  role: string;
  is_active: boolean;
  first_login_at: string | null;
  last_activity_at: string | null;
  member_since: string | null;
};

/** ממיר שורת RPC ל-AppOrgMember */
export function mapDbOrgMemberRowToApp(row: DbOrgMemberRow): AppOrgMember {
  return {
    userId: row.user_id,
    displayName: row.display_name || "",
    email: row.email || "",
    role: row.role === "manager" ? "manager" : "user",
    isActive: Boolean(row.is_active),
    firstLoginAt: row.first_login_at,
    lastActivityAt: row.last_activity_at,
    memberSince: row.member_since
  };
}

/** ממיר מערך שורות DB */
export function mapDbOrgMemberRowsToApp(rows: DbOrgMemberRow[]): AppOrgMember[] {
  return (rows || []).map(mapDbOrgMemberRowToApp);
}
