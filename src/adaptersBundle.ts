/** נקודת כניסה ל-bundle — adapters + shared helpers */
export {
  createSupabaseTasksAdapter,
  type SupabaseTasksAdapter
} from "./data/adapters/supabase/supabaseTasksAdapter.js";
export {
  createSupabaseTasksReadAdapter,
  type SupabaseTasksReadAdapter
} from "./data/adapters/supabase/supabaseTasksReadAdapter.js";
export {
  createSupabaseTasksWriteAdapter,
  loadSupabaseTasksWriteContext,
  mapAppTaskToSupabaseInsert,
  type SupabaseTasksWriteAdapter
} from "./data/adapters/supabase/supabaseTasksWriteAdapter.js";
export {
  createSupabaseSuppliersAdapter,
  type SupabaseSuppliersAdapter
} from "./data/adapters/supabase/supabaseSuppliersAdapter.js";
export { normalizeTask } from "./data/shared/normalizeTask.js";
export { defaultTaskReminder } from "./data/shared/defaultTaskReminder.js";
export { getDateBucketFromIso, isoDateFromOffset, toIsoDateOnly } from "./data/shared/dateUtils.js";
export type { AppTask } from "./data/types/appTask.js";
