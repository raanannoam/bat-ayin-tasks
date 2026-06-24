const NOT_IMPLEMENTED = "Not implemented yet";

/** placeholder — parity עם localSuppliersAdapter */
export type SupabaseSuppliersAdapter = {
  loadSuppliers(): never;
  saveSuppliers(suppliers: unknown[]): never;
  createSupplierOrder(suppliers: unknown[], item: unknown): never;
  updateSupplierOrder(
    suppliers: unknown[],
    id: string,
    patchOrUpdater: unknown
  ): never;
  deleteSupplierOrderSoft(suppliers: unknown[], id: string, deletedBy: string): never;
  updateSupplierStage(
    suppliers: unknown[],
    id: string,
    step: string,
    checked: boolean,
    dateValue?: string | null
  ): never;
  markAllSupplierStages(suppliers: unknown[], id: string): never;
};

function throwNotImplemented(): never {
  throw new Error(NOT_IMPLEMENTED);
}

/** adapter ספקים — placeholder עד Supabase suppliers phase */
export function createSupabaseSuppliersAdapter(): SupabaseSuppliersAdapter {
  return {
    loadSuppliers() {
      return throwNotImplemented();
    },
    saveSuppliers() {
      return throwNotImplemented();
    },
    createSupplierOrder() {
      return throwNotImplemented();
    },
    updateSupplierOrder() {
      return throwNotImplemented();
    },
    deleteSupplierOrderSoft() {
      return throwNotImplemented();
    },
    updateSupplierStage() {
      return throwNotImplemented();
    },
    markAllSupplierStages() {
      return throwNotImplemented();
    }
  };
}
