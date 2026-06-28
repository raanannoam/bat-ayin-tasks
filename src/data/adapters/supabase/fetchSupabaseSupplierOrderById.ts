import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppSupplier } from "../../types/appSupplier.js";
import { DEFAULT_ORGANIZATION_ID } from "./constants.js";
import { loadSupabaseSuppliersReadContext } from "./loadSupabaseSuppliersReadContext.js";
import { mapDbSupplierOrderRowToApp } from "./mapDbSupplierOrderRowToApp.js";

const ORDER_SELECT =
  "id, supplier_name, description, amount_text, due_date, notes, document_notes, all_assignees, assignee_ids, order_completed, order_completed_at, received_completed, received_completed_at, payment_completed, payment_completed_at, invoice_completed, invoice_completed_at, created_at, deleted_at, deleted_by";

type FetchOptions = {
  includeDeleted?: boolean;
};

/** טוען הזמנת ספק בודדת + קישורים */
export async function fetchSupabaseSupplierOrderById(
  client: SupabaseClient,
  orderId: string,
  options: FetchOptions = {}
): Promise<AppSupplier> {
  const ctx = await loadSupabaseSuppliersReadContext(client);
  const batAyin = client.schema("bat_ayin");
  let orderQuery = batAyin
    .from("supplier_orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .eq("organization_id", DEFAULT_ORGANIZATION_ID);
  if (!options.includeDeleted) {
    orderQuery = orderQuery.is("deleted_at", null);
  }
  const orderResult = await orderQuery.single();
  if (orderResult.error) throw orderResult.error;
  const linksResult = await batAyin
    .from("supplier_order_links")
    .select("url")
    .eq("supplier_order_id", orderId)
    .eq("organization_id", DEFAULT_ORGANIZATION_ID)
    .is("deleted_at", null);
  if (linksResult.error) throw linksResult.error;
  const links = (linksResult.data || []).map((row) => row.url).filter(Boolean) as string[];
  return mapDbSupplierOrderRowToApp(orderResult.data, ctx, links);
}

export { ORDER_SELECT };
