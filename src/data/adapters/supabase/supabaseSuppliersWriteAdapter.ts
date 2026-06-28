import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppSupplier } from "../../types/appSupplier.js";
import {
  applySupabaseSupplierSoftDelete,
  applySupabaseSupplierUpdate
} from "./applySupabaseSupplierUpdate.js";
import { fetchSupabaseSupplierOrderById } from "./fetchSupabaseSupplierOrderById.js";
import { loadSupabaseSuppliersWriteContext } from "./loadSupabaseSuppliersWriteContext.js";
import { mapAppSupplierOrderToInsert } from "./mapAppSupplierOrderToInsert.js";
import { insertSupplierOrderLinks } from "./syncSupplierOrderLinks.js";
import {
  buildMarkAllSupplierStagesPayload,
  buildSupplierStageUpdatePayload
} from "./supplierStepMaps.js";

type SupplierUpdater = AppSupplier | ((item: AppSupplier) => AppSupplier);

/** חוזה adapter כתיבה — parity עם localSuppliersAdapter */
export type SupabaseSuppliersWriteAdapter = {
  createSupplierOrder(suppliers: AppSupplier[], item: AppSupplier): Promise<AppSupplier[]>;
  updateSupplierOrder(
    suppliers: AppSupplier[],
    id: string,
    patchOrUpdater: Partial<AppSupplier> | SupplierUpdater
  ): Promise<AppSupplier[]>;
  deleteSupplierOrderSoft(
    suppliers: AppSupplier[],
    id: string,
    deletedBy: string
  ): Promise<AppSupplier[]>;
  updateSupplierStage(
    suppliers: AppSupplier[],
    id: string,
    step: string,
    checked: boolean,
    dateValue?: string | null
  ): Promise<AppSupplier[]>;
  markAllSupplierStages(suppliers: AppSupplier[], id: string): Promise<AppSupplier[]>;
};

function resolveSupplierPatch(
  existing: AppSupplier,
  patchOrUpdater: Partial<AppSupplier> | SupplierUpdater
): AppSupplier {
  return typeof patchOrUpdater === "function"
    ? patchOrUpdater(existing)
    : { ...existing, ...patchOrUpdater };
}

/** יוצר adapter כתיבה להזמנות ספק */
export function createSupabaseSuppliersWriteAdapter(
  client: SupabaseClient | null
): SupabaseSuppliersWriteAdapter {
  return {
    async createSupplierOrder(suppliers, item) {
      if (!client) throw new Error("Supabase is not configured.");
      const contextResult = await loadSupabaseSuppliersWriteContext(client);
      if (!contextResult.ok) {
        throw new Error(contextResult.reason || contextResult.code || "Write context load failed.");
      }
      const mapResult = mapAppSupplierOrderToInsert(item, contextResult.ctx);
      if (!mapResult.ok) {
        throw new Error(mapResult.reason || mapResult.code || "Supplier mapping failed.");
      }
      const { data, error } = await client
        .schema("bat_ayin")
        .from("supplier_orders")
        .insert(mapResult.payload)
        .select()
        .single();
      if (error) throw error;
      await insertSupplierOrderLinks(client, data.id, mapResult.links);
      const created = await fetchSupabaseSupplierOrderById(client, data.id);
      return [created, ...(suppliers || [])];
    },
    updateSupplierOrder(suppliers, id, patchOrUpdater) {
      const existing = suppliers.find((item) => item.id === id);
      if (!existing) return Promise.resolve(suppliers);
      const next = resolveSupplierPatch(existing, patchOrUpdater);
      return applySupabaseSupplierUpdate(client, suppliers, id, next);
    },
    deleteSupplierOrderSoft(suppliers, id, deletedBy) {
      return applySupabaseSupplierSoftDelete(client, suppliers, id, deletedBy);
    },
    async updateSupplierStage(suppliers, id, step, checked, dateValue = null) {
      if (!client) throw new Error("Supabase is not configured.");
      const existing = suppliers.find((item) => item.id === id);
      if (!existing) return suppliers;
      const payload = buildSupplierStageUpdatePayload(step, checked, dateValue);
      if (!payload) return suppliers;
      const contextResult = await loadSupabaseSuppliersWriteContext(client);
      if (!contextResult.ok) {
        throw new Error(contextResult.reason || contextResult.code || "Write context load failed.");
      }
      const { error } = await client
        .schema("bat_ayin")
        .from("supplier_orders")
        .update(payload)
        .eq("id", id)
        .eq("organization_id", contextResult.ctx.organizationId);
      if (error) throw error;
      const updated = await fetchSupabaseSupplierOrderById(client, id);
      return suppliers.map((item) => (item.id === id ? updated : item));
    },
    async markAllSupplierStages(suppliers, id) {
      if (!client) throw new Error("Supabase is not configured.");
      const existing = suppliers.find((item) => item.id === id);
      if (!existing) return suppliers;
      const payload = buildMarkAllSupplierStagesPayload(existing.step_dates);
      const contextResult = await loadSupabaseSuppliersWriteContext(client);
      if (!contextResult.ok) {
        throw new Error(contextResult.reason || contextResult.code || "Write context load failed.");
      }
      const { error } = await client
        .schema("bat_ayin")
        .from("supplier_orders")
        .update(payload)
        .eq("id", id)
        .eq("organization_id", contextResult.ctx.organizationId);
      if (error) throw error;
      const updated = await fetchSupabaseSupplierOrderById(client, id);
      return suppliers.map((item) => (item.id === id ? updated : item));
    }
  };
}
