import type { AppSupplier } from "../../types/appSupplier.js";
import { SUPPLIER_STEP_IDS } from "../../types/appSupplier.js";
import { isoDateFromOffset } from "../../shared/dateUtils.js";
import { normalizeSupplier } from "../../shared/normalizeSupplier.js";
import { safeParseStorage, writeStorageJson } from "../../shared/browserStorage.js";
import { STARTER_SUPPLIERS } from "./starterSuppliers.js";

/** חוזה adapter ספקים מקומי — parity עם SupabaseSuppliersAdapter (סינכרוני) */
export type LocalSuppliersAdapter = {
  loadSuppliers(): AppSupplier[];
  saveSuppliers(suppliers: AppSupplier[]): AppSupplier[];
  createSupplierOrder(suppliers: AppSupplier[], item: AppSupplier): AppSupplier[];
  updateSupplierOrder(
    suppliers: AppSupplier[],
    id: string,
    patchOrUpdater: Partial<AppSupplier> | ((item: AppSupplier) => AppSupplier)
  ): AppSupplier[];
  deleteSupplierOrderSoft(suppliers: AppSupplier[], id: string, deletedBy: string): AppSupplier[];
  updateSupplierStage(
    suppliers: AppSupplier[],
    id: string,
    step: string,
    checked: boolean,
    dateValue?: string | null
  ): AppSupplier[];
  markAllSupplierStages(suppliers: AppSupplier[], id: string): AppSupplier[];
};

/** adapter localStorage לספקים — production path */
export function createLocalSuppliersAdapter(): LocalSuppliersAdapter {
  return {
    loadSuppliers() {
      if (!localStorage.getItem("beit-suppliers")) {
        writeStorageJson("beit-suppliers", STARTER_SUPPLIERS);
      }
      const value = safeParseStorage<unknown>("beit-suppliers", null);
      const raw = Array.isArray(value) ? value : STARTER_SUPPLIERS;
      return raw.map((item, index) => normalizeSupplier(item, index));
    },
    saveSuppliers(suppliers) {
      writeStorageJson("beit-suppliers", suppliers);
      return suppliers;
    },
    createSupplierOrder(suppliers, item) {
      return this.saveSuppliers([item, ...suppliers]);
    },
    updateSupplierOrder(suppliers, id, patchOrUpdater) {
      return this.saveSuppliers(
        suppliers.map((item) => {
          if (item.id !== id) return item;
          return typeof patchOrUpdater === "function" ? patchOrUpdater(item) : { ...item, ...patchOrUpdater };
        })
      );
    },
    deleteSupplierOrderSoft(suppliers, id, deletedBy) {
      return this.updateSupplierOrder(suppliers, id, {
        deleted_at: isoDateFromOffset(0),
        deleted_by: deletedBy
      });
    },
    updateSupplierStage(suppliers, id, step, checked, dateValue = null) {
      return this.updateSupplierOrder(suppliers, id, (item) => ({
        ...item,
        steps: { ...item.steps, [step]: dateValue ? true : checked },
        step_dates: dateValue === null ? item.step_dates : { ...item.step_dates, [step]: dateValue }
      }));
    },
    markAllSupplierStages(suppliers, id) {
      const today = isoDateFromOffset(0);
      const allSteps = SUPPLIER_STEP_IDS.reduce(
        (acc, step) => ({ ...acc, [step]: true }),
        {} as AppSupplier["steps"]
      );
      return this.updateSupplierOrder(suppliers, id, (item) => ({
        ...item,
        steps: allSteps,
        step_dates: SUPPLIER_STEP_IDS.reduce(
          (acc, step) => ({ ...acc, [step]: item.step_dates[step] || today }),
          {} as AppSupplier["step_dates"]
        )
      }));
    }
  };
}
