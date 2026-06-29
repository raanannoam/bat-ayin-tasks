import type { SupabaseClient, User } from "@supabase/supabase-js";

type ProfileRow = { id: string; display_name: string; email: string };

/** יוצר פרופיל אם חסר — אחרי Google OAuth */
export async function ensurePilotProfile(
  client: SupabaseClient,
  user: User
): Promise<{ ok: true; profile: ProfileRow } | { ok: false; code: string; reason?: string }> {
  const existing = await client
    .from("profiles")
    .select("id, display_name, email")
    .eq("id", user.id)
    .maybeSingle();

  if (existing.error) {
    return { ok: false, code: "profile_load_failed", reason: existing.error.message };
  }
  if (existing.data) {
    return { ok: true, profile: existing.data as ProfileRow };
  }

  const email = user.email?.trim() || "";
  if (!email) {
    return { ok: false, code: "email_missing", reason: "Google account has no email." };
  }

  const meta = user.user_metadata || {};
  const displayName =
    String(meta.full_name || meta.name || email.split("@")[0] || "משתמש").trim() || "משתמש";

  const inserted = await client
    .from("profiles")
    .insert({ id: user.id, email, display_name: displayName })
    .select("id, display_name, email")
    .single();

  if (inserted.error) {
    return { ok: false, code: "profile_create_failed", reason: inserted.error.message };
  }

  return { ok: true, profile: inserted.data as ProfileRow };
}
