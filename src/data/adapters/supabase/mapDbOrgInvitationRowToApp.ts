import type { AppOrgInvitation } from "../../types/appOrgMember.js";

type DbOrgInvitationRow = {
  id: string;
  email: string;
  role: string;
  created_at: string | null;
};

/** ממיר שורת RPC להזמנה ממתינה ל-AppOrgInvitation */
export function mapDbOrgInvitationRowToApp(row: DbOrgInvitationRow): AppOrgInvitation {
  return {
    id: row.id,
    email: row.email || "",
    role: row.role === "manager" ? "manager" : "user",
    createdAt: row.created_at
  };
}

/** ממיר מערך שורות DB */
export function mapDbOrgInvitationRowsToApp(rows: DbOrgInvitationRow[]): AppOrgInvitation[] {
  return (rows || []).map(mapDbOrgInvitationRowToApp);
}
