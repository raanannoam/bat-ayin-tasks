import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppSupplier } from "../../types/appSupplier.js";
import { isoDateFromOffset } from "../../shared/dateUtils.js";
import { fetchSupabaseSupplierOrderById } from "./fetchSupabaseSupplierOrderById.js";
import { loadSupabaseSuppliersWriteContext } from "./loadSupabaseSuppliersWriteContext.js";
import { mapAppSupplierToSupabaseUpdate } from "./mapAppSupplierOrderToInsert.js";
import { syncSupplierOrderLinks } from "./syncSupplierOrderLinks.js";
import { toDbTimestamp } from "./supplierStepMaps.js";

/** מעדכן הזמנה מלאה ב-Supabase ומחזיר רשימה מעודכנת */
export async function applySupabaseSupplierUpdate(
  client: SupabaseClient | null,
  suppliers: AppSupplier[],
  id: string,
  next: AppSupplier,
  options: { includeDeleted?: boolean; syncLinks?: boolean } = {}
): Promise<AppSupplier[]> {
  if (!client) throw new Error("Supabase is not configured.");
  const existing = suppliers.find((item) => item.id === id);
  if (!existing) return suppliers;
  const contextResult = await loadSupabaseSuppliersWriteContext(client);
  if (!contextResult.ok) {
    throw new Error(contextResult.reason || contextResult.code || "Write context load failed.");
  }
  const mapResult = mapAppSupplierToSupabaseUpdate(next, contextResult.ctx);
  if (!mapResult.ok) {
    throw new Error(mapResult.reason || mapResult.code || "Supplier mapping failed.");
  }
  const { error } = await client
    .schema("bat_ayin")
    .from("supplier_orders")
    .update(mapResult.payload)
    .eq("id", id)
    .eq("organization_id", contextResult.ctx.organizationId);
  if (error) throw error;
  if (options.syncLinks !== false) {
    await syncSupplierOrderLinks(client, id, mapResult.links);
  }
  const updated = await fetchSupabaseSupplierOrderById(client, id, {
    includeDeleted: options.includeDeleted
  });
  return suppliers.map((item) => (item.id === id ? updated : item));
}

/** soft delete — parity עם localSuppliersAdapter */
export async function applySupabaseSupplierSoftDelete(
  client: SupabaseClient | null,
  suppliers: AppSupplier[],
  id: string,
  deletedBy: string
): Promise<AppSupplier[]> {
  if (!client) throw new Error("Supabase is not configured.");
  const existing = suppliers.find((item) => item.id === id);
  if (!existing) return suppliers;
  const contextResult = await loadSupabaseSuppliersWriteContext(client);
  if (!contextResult.ok) {
    throw new Error(contextResult.reason || contextResult.code || "Write context load failed.");
  }
  const deletedById = contextResult.ctx.profileIdByName.get(String(deletedBy).trim());
  if (!deletedById) {
    throw new Error("Deleted-by name does not exist in Supabase member map.");
  }
  const { error } = await client
    .schema("bat_ayin")
    .rpc("soft_delete_supplier_order", { p_order_id: id });
  if (error) throw error;
  const updated = {
    ...existing,
    deleted_at: isoDateFromOffset(0),
    deleted_by: deletedBy
  };
  return suppliers.map((item) => (item.id === id ? updated : item));
}
