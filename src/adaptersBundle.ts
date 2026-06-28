/** נקודת כניסה ל-bundle — adapters + shared helpers + catalog */
export {
  createSupabaseTasksAdapter,
  type SupabaseTasksAdapter
} from "./data/adapters/supabase/supabaseTasksAdapter.js";
export {
  createSupabaseSuppliersAdapter,
  type SupabaseSuppliersAdapter
} from "./data/adapters/supabase/supabaseSuppliersAdapter.js";
export {
  loadSupabaseTasksWriteContext,
  mapAppTaskToSupabaseInsert
} from "./data/adapters/supabase/supabaseTasksWriteAdapter.js";
export {
  createLocalTasksAdapter,
  type LocalTasksAdapter
} from "./data/adapters/local/localTasksAdapter.js";
export {
  createLocalSuppliersAdapter,
  type LocalSuppliersAdapter
} from "./data/adapters/local/localSuppliersAdapter.js";
export { normalizeTask } from "./data/shared/normalizeTask.js";
export { normalizeSupplier } from "./data/shared/normalizeSupplier.js";
export { defaultTaskReminder } from "./data/shared/defaultTaskReminder.js";
export { createAsyncRepository } from "./data/shared/createAsyncRepository.js";
export {
  safeParseStorage,
  safeArrayStorage,
  safeObjectStorage,
  writeStorageJson
} from "./data/shared/browserStorage.js";
export {
  dateFromIso,
  daysBetween,
  daysFromTodayIso,
  getDateBucketFromIso,
  isoDateFromOffset,
  startOfToday,
  toIsoDateOnly
} from "./data/shared/dateUtils.js";
export { BASE_CATEGORIES, type CategoryItem } from "./data/catalog/baseCategories.js";
export {
  loadCategories,
  readCustomCategories,
  readHiddenCategoryIds,
  saveCustomCategories,
  saveHiddenCategoryIds
} from "./data/catalog/categoriesService.js";
export { BASE_PEOPLE } from "./data/catalog/basePeople.js";
export {
  allKnownPeople,
  loadPeople,
  readCustomPeople,
  readHiddenPeople,
  saveCustomPeople,
  saveHiddenPeople
} from "./data/catalog/peopleService.js";
export { SUPPLIER_STEPS, type SupplierStepMeta } from "./data/catalog/supplierStepsMeta.js";
export {
  DEFAULT_PREFS,
  loadPreferences,
  savePreferences,
  type AppPreferences
} from "./data/catalog/preferencesService.js";
export { DEMO_MANAGER_OWNER, DEMO_USER_OWNER, personalOwner, type AccessContext, type AppRole } from "./domain/shared/appRoles.js";
export { ageLabel, relativeAgeLabel } from "./domain/shared/ageLabels.js";
export { formatHebrewDate } from "./domain/shared/formatHebrewDate.js";
export { priorityLabel } from "./domain/shared/priorityLabel.js";
export { resolveCategory } from "./domain/shared/resolveCategory.js";
export { filterActiveTasks } from "./domain/tasks/taskActive.js";
export { buildTaskDueLabel, isTaskOverdue, taskDueRank } from "./domain/tasks/taskDue.js";
export {
  filterManagementPeople,
  filterOpenTasks,
  filterPersonalTasks,
  filterVisibleDoneTasks,
  isArchivedDone
} from "./domain/tasks/taskFilters.js";
export { findTask, findVisibleTask } from "./domain/tasks/taskLookup.js";
export { canAccessTask, canDeleteTask, canEditTaskContent } from "./domain/tasks/taskPermissions.js";
export { resolveCurrentSort, sortOptions, sortTasks, taskGroupTitle } from "./domain/tasks/taskSort.js";
export { filterVisibleSuppliers } from "./domain/suppliers/supplierFilters.js";
export { findSupplier, findVisibleSupplier } from "./domain/suppliers/supplierLookup.js";
export { canAccessSupplier } from "./domain/suppliers/supplierPermissions.js";
export { supplierProgress } from "./domain/suppliers/supplierProgress.js";
