/** תפקידי runtime — נקבעים מ-organization_members בפיילוט */
export type AppRole = "manager" | "user";

/** לבדיקות / mock ישן — לא לשימוש ב-runtime פיילוט */
export const DEMO_USER_OWNER = "עדינה";
export const DEMO_MANAGER_OWNER = "צבי";

export type AccessContext = {
  role: AppRole;
  /** שם תצוגה של המשתמש המחובר — חובה ל-user */
  userOwner: string;
  /** מזהה auth של המשתמש המחובר — Supabase pilot */
  userId?: string;
};

/** מבצע אישי — תמיד המשתמש המחובר */
export function personalOwner(ctx: AccessContext): string {
  return ctx.userOwner;
}
