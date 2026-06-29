import type { AppSupplier } from "../data/types/appSupplier.js";
import type { AppTask } from "../data/types/appTask.js";
import { safeParseStorage } from "../data/shared/browserStorage.js";
import { PILOT_MIGRATION_STORAGE_KEY } from "./pilotConfig.js";

type TasksRepo = {
  loadTasks: () => Promise<AppTask[]>;
  createTask: (tasks: AppTask[], task: AppTask) => Promise<AppTask[]>;
};

type SuppliersRepo = {
  loadSuppliers: () => Promise<AppSupplier[]>;
  createSupplierOrder: (suppliers: AppSupplier[], item: AppSupplier) => Promise<AppSupplier[]>;
};

function readLocalTasks(): AppTask[] {
  const tasks = safeParseStorage<AppTask[]>("beit-tasks", []);
  return Array.isArray(tasks) ? tasks.filter((t) => t && !t.deleted_at) : [];
}

function readLocalSuppliers(): AppSupplier[] {
  const suppliers = safeParseStorage<AppSupplier[]>("beit-suppliers", []);
  return Array.isArray(suppliers) ? suppliers.filter((s) => s && !s.deleted_at) : [];
}

function migrationDone(): boolean {
  try {
    return localStorage.getItem(PILOT_MIGRATION_STORAGE_KEY) === "done";
  } catch {
    return false;
  }
}

function markMigrationDone(): void {
  try {
    localStorage.setItem(PILOT_MIGRATION_STORAGE_KEY, "done");
  } catch {
    /* ignore quota */
  }
}

/** מעביר נתוני localStorage ל-Supabase — פעם אחת, מנהל בלבד */
export async function migrateLocalPilotData(options: {
  isManager: boolean;
  tasksRepository: TasksRepo;
  suppliersRepository: SuppliersRepo;
}): Promise<{
  ok: boolean;
  skipped: boolean;
  migratedTasks: number;
  migratedSuppliers: number;
  reason?: string;
}> {
  if (!options.isManager) {
    return { ok: true, skipped: true, migratedTasks: 0, migratedSuppliers: 0, reason: "not_manager" };
  }
  if (migrationDone()) {
    return { ok: true, skipped: true, migratedTasks: 0, migratedSuppliers: 0, reason: "already_migrated" };
  }

  const localTasks = readLocalTasks();
  const localSuppliers = readLocalSuppliers();
  if (!localTasks.length && !localSuppliers.length) {
    markMigrationDone();
    return { ok: true, skipped: true, migratedTasks: 0, migratedSuppliers: 0, reason: "no_local_data" };
  }

  let migratedTasks = 0;
  let migratedSuppliers = 0;

  try {
    let remoteTasks = await options.tasksRepository.loadTasks();
    if (!remoteTasks.length && localTasks.length) {
      for (const task of localTasks) {
        const { id: _dropId, ...taskBody } = task;
        remoteTasks = await options.tasksRepository.createTask(remoteTasks, taskBody as AppTask);
        migratedTasks += 1;
      }
    }

    let remoteSuppliers = await options.suppliersRepository.loadSuppliers();
    if (!remoteSuppliers.length && localSuppliers.length) {
      for (const supplier of localSuppliers) {
        const { id: _dropId, ...supplierBody } = supplier;
        remoteSuppliers = await options.suppliersRepository.createSupplierOrder(
          remoteSuppliers,
          supplierBody as AppSupplier
        );
        migratedSuppliers += 1;
      }
    }

    markMigrationDone();
    return { ok: true, skipped: false, migratedTasks, migratedSuppliers };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, skipped: false, migratedTasks, migratedSuppliers, reason: message };
  }
}
