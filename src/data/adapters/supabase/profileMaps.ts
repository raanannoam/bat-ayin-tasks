/** בניית מפות slug/id ושם/profile מתוך שורות DB */
type SlugRow = { id: string; slug: string };
type ProfileRow = { id: string; display_name: string };

export function buildCategorySlugById(rows: SlugRow[] | null | undefined) {
  return new Map((rows || []).map((row) => [row.id, row.slug]));
}

export function buildCategoryIdBySlug(rows: SlugRow[] | null | undefined) {
  return new Map((rows || []).map((row) => [row.slug, row.id]));
}

export function buildProfileNameById(rows: ProfileRow[] | null | undefined) {
  return new Map((rows || []).map((row) => [row.id, row.display_name]));
}

export function buildProfileIdByName(rows: ProfileRow[] | null | undefined) {
  return new Map((rows || []).map((row) => [row.display_name, row.id]));
}
