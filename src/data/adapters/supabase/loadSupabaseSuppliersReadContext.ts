import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_ORGANIZATION_ID } from "./constants.js";
import { buildProfileNameById } from "./profileMaps.js";

export type SupabaseSuppliersReadContext = {
  profileNameById: Map<string, string>;
};

/** הקשר קריאה — מפת שמות פרופילים */
export async function loadSupabaseSuppliersReadContext(
  client: SupabaseClient
): Promise<SupabaseSuppliersReadContext> {
  const batAyin = client.schema("bat_ayin");
  const membersResult = await batAyin
    .from("organization_members")
    .select("user_id")
    .eq("organization_id", DEFAULT_ORGANIZATION_ID)
    .eq("is_active", true);
  if (membersResult.error) throw membersResult.error;
  const userIds = [...new Set((membersResult.data || []).map((row) => row.user_id))];
  let profileRows: { id: string; display_name: string }[] = [];
  if (userIds.length) {
    const profilesResult = await client.from("profiles").select("id, display_name").in("id", userIds);
    if (profilesResult.error) throw profilesResult.error;
    profileRows = profilesResult.data || [];
  }
  return { profileNameById: buildProfileNameById(profileRows) };
}
