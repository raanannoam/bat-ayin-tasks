/** הגדרות פיילוט — Supabase משותף, debug רק עם query מפורש */

export const PILOT_SUPABASE_URL = "https://jxjxjvxbxpgvlarzbohm.supabase.co";

/** כתובת production — OAuth חייב לחזור сюда, לא ל-localhost */
export const PILOT_APP_URL = "https://bat-ayin-tasks.vercel.app";

/** כתובת callback ל-Google OAuth — קבועה (לא location.origin; באנדרואיד SW/PWA יכולים לבלבל origin) */
export function getPilotOAuthRedirectUrl(): string {
  return `${PILOT_APP_URL}/index.html`;
}

export const PILOT_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4anhqdnhieHBndmxhcnpib2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTgyNjUsImV4cCI6MjA5NTUzNDI2NX0.g1W8SJWTRc3FYeZJIVdLBTKcSfHVgfQQZ_brjRKest4";

export const PILOT_MIGRATION_STORAGE_KEY = "beit-pilot-migrated";

export type PilotDataBackend = "supabase" | "local";

/** ברירת מחדל: supabase. local רק עם ?debugBackend=local */
export function resolvePilotDataBackend(searchParams: URLSearchParams): PilotDataBackend {
  if (searchParams.get("debugBackend") === "local") return "local";
  return "supabase";
}

/** כלי debug / harness — לא למשתמשי פיילוט רגילים */
export function isPilotDebugEnabled(searchParams: URLSearchParams): boolean {
  const backend = searchParams.get("debugBackend");
  return searchParams.get("debug") === "1" || backend === "local" || backend === "supabase";
}

export function isSupabasePlaceholder(value: string | null | undefined): boolean {
  if (!value || typeof value !== "string") return true;
  return value.includes("your-project") || value.includes("your-supabase-anon-key");
}
