import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppSupplier } from "../../types/appSupplier.js";
import { createSupabaseSuppliersReadAdapter } from "./supabaseSuppliersReadAdapter.js";
import { createSupabaseSuppliersWriteAdapter } from "./supabaseSuppliersWriteAdapter.js";

/** חוזה adapter ספקים — parity עם localSuppliersAdapter */
export type SupabaseSuppliersAdapter = {
  loadSuppliers(): Promise<AppSupplier[]>;
  saveSuppliers(suppliers: AppSupplier[]): AppSupplier[];
  createSupplierOrder(suppliers: AppSupplier[], item: AppSupplier): Promise<AppSupplier[]>;
  updateSupplierOrder(
    suppliers: AppSupplier[],
    id: string,
    patchOrUpdater: Partial<AppSupplier> | ((item: AppSupplier) => AppSupplier)
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

/** adapter מאוחד — read + write + saveSuppliers noop */
export function createSupabaseSuppliersAdapter(
  client: SupabaseClient | null
): SupabaseSuppliersAdapter {
  const readAdapter = createSupabaseSuppliersReadAdapter(client);
  const writeAdapter = createSupabaseSuppliersWriteAdapter(client);
  return {
    loadSuppliers() {
      return readAdapter.loadSuppliers();
    },
    saveSuppliers(suppliers) {
      return suppliers;
    },
    createSupplierOrder(suppliers, item) {
      return writeAdapter.createSupplierOrder(suppliers, item);
    },
    updateSupplierOrder(suppliers, id, patchOrUpdater) {
      return writeAdapter.updateSupplierOrder(suppliers, id, patchOrUpdater);
    },
    deleteSupplierOrderSoft(suppliers, id, deletedBy) {
      return writeAdapter.deleteSupplierOrderSoft(suppliers, id, deletedBy);
    },
    updateSupplierStage(suppliers, id, step, checked, dateValue) {
      return writeAdapter.updateSupplierStage(suppliers, id, step, checked, dateValue);
    },
    markAllSupplierStages(suppliers, id) {
      return writeAdapter.markAllSupplierStages(suppliers, id);
    }
  };
}
