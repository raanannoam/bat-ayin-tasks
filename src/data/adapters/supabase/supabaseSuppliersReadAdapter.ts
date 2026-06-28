import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppSupplier } from "../../types/appSupplier.js";
import { NO_SUPABASE_AUTH_SESSION_REASON } from "./constants.js";
import { DEFAULT_ORGANIZATION_ID } from "./constants.js";
import { groupLinksByOrderId } from "./groupLinksByOrderId.js";
import { loadSupabaseSuppliersReadContext } from "./loadSupabaseSuppliersReadContext.js";
import { mapDbSupplierOrderRowToApp } from "./mapDbSupplierOrderRowToApp.js";
import { ORDER_SELECT } from "./fetchSupabaseSupplierOrderById.js";

/** חוזה adapter קריאה — loadSuppliers */
export type SupabaseSuppliersReadAdapter = {
  loadSuppliers(): Promise<AppSupplier[]>;
};

/** יוצר adapter קריאה להזמנות ספק */
export function createSupabaseSuppliersReadAdapter(
  client: SupabaseClient | null
): SupabaseSuppliersReadAdapter {
  return {
    async loadSuppliers() {
      if (!client) throw new Error("Supabase is not configured.");
      const { data: authData, error: authError } = await client.auth.getSession();
      if (authError) throw authError;
      if (!authData.session) throw new Error(NO_SUPABASE_AUTH_SESSION_REASON);
      const batAyin = client.schema("bat_ayin");
      const ctx = await loadSupabaseSuppliersReadContext(client);
      const ordersResult = await batAyin
        .from("supplier_orders")
        .select(ORDER_SELECT)
        .eq("organization_id", DEFAULT_ORGANIZATION_ID)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });
      if (ordersResult.error) throw ordersResult.error;
      const orderRows = ordersResult.data || [];
      if (!orderRows.length) return [];
      const orderIds = orderRows.map((row) => row.id);
      const linksResult = await batAyin
        .from("supplier_order_links")
        .select("supplier_order_id, url")
        .in("supplier_order_id", orderIds)
        .eq("organization_id", DEFAULT_ORGANIZATION_ID)
        .is("deleted_at", null);
      if (linksResult.error) throw linksResult.error;
      const linksByOrderId = groupLinksByOrderId(linksResult.data);
      return orderRows.map((row) =>
        mapDbSupplierOrderRowToApp(row, ctx, linksByOrderId.get(row.id) || [])
      );
    }
  };
}
