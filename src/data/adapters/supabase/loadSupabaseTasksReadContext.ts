import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_ORGANIZATION_ID } from "./constants.js";
import { buildCategorySlugById, buildProfileNameById } from "./profileMaps.js";

export type SupabaseTasksReadContext = {
  categorySlugById: Map<string, string>;
  profileNameById: Map<string, string>;
};

/** הקשר קריאה — מפות slug ושמות לשורת task שהוחזרה מ-INSERT */
export async function loadSupabaseTasksReadContext(
  client: SupabaseClient
): Promise<SupabaseTasksReadContext> {
  const batAyin = client.schema("bat_ayin");
  const [categoriesResult, membersResult] = await Promise.all([
    batAyin
      .from("categories")
      .select("id, slug")
      .eq("organization_id", DEFAULT_ORGANIZATION_ID)
      .is("deleted_at", null),
    batAyin
      .from("organization_members")
      .select("user_id")
      .eq("organization_id", DEFAULT_ORGANIZATION_ID)
      .eq("is_active", true)
  ]);
  if (categoriesResult.error) throw categoriesResult.error;
  if (membersResult.error) throw membersResult.error;
  const userIds = [...new Set((membersResult.data || []).map((row) => row.user_id))];
  let profileRows: { id: string; display_name: string }[] = [];
  if (userIds.length) {
    const profilesResult = await client.from("profiles").select("id, display_name").in("id", userIds);
    if (profilesResult.error) throw profilesResult.error;
    profileRows = profilesResult.data || [];
  }
  return {
    categorySlugById: buildCategorySlugById(categoriesResult.data),
    profileNameById: buildProfileNameById(profileRows)
  };
}
