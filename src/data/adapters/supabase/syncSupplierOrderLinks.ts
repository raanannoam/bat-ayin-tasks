import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_ORGANIZATION_ID } from "./constants.js";

/** מחליף קישורי הזמנה — soft delete ישנים + insert חדשים */
export async function syncSupplierOrderLinks(
  client: SupabaseClient,
  orderId: string,
  links: string[]
) {
  const batAyin = client.schema("bat_ayin");
  const existingResult = await batAyin
    .from("supplier_order_links")
    .select("id")
    .eq("supplier_order_id", orderId)
    .eq("organization_id", DEFAULT_ORGANIZATION_ID)
    .is("deleted_at", null);
  if (existingResult.error) throw existingResult.error;
  const existingIds = (existingResult.data || []).map((row) => row.id);
  for (const id of existingIds) {
    const { error } = await batAyin.rpc("soft_delete_supplier_order_link", { p_link_id: id });
    if (error) throw error;
  }
  const nextLinks = [...new Set(links.filter(Boolean))];
  if (!nextLinks.length) return;
  const rows = nextLinks.map((url) => ({
    organization_id: DEFAULT_ORGANIZATION_ID,
    supplier_order_id: orderId,
    url,
    link_type: "link"
  }));
  const { error: insertError } = await batAyin.from("supplier_order_links").insert(rows);
  if (insertError) throw insertError;
}

/** insert קישורים להזמנה חדשה */
export async function insertSupplierOrderLinks(
  client: SupabaseClient,
  orderId: string,
  links: string[]
) {
  const nextLinks = [...new Set(links.filter(Boolean))];
  if (!nextLinks.length) return;
  const rows = nextLinks.map((url) => ({
    organization_id: DEFAULT_ORGANIZATION_ID,
    supplier_order_id: orderId,
    url,
    link_type: "link"
  }));
  const { error } = await client.schema("bat_ayin").from("supplier_order_links").insert(rows);
  if (error) throw error;
}
