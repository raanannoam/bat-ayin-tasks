/** תפקידי runtime — mockup קבוע */
export type AppRole = "manager" | "user";

export const DEMO_USER_OWNER = "עדינה";
export const DEMO_MANAGER_OWNER = "צבי";

export type AccessContext = {
  role: AppRole;
  userOwner?: string;
};

/** מבצע "אישי" לפי תפקיד — mockup קבוע */
export function personalOwner(ctx: AccessContext): string {
  return ctx.role === "manager" ? DEMO_MANAGER_OWNER : ctx.userOwner ?? DEMO_USER_OWNER;
}
