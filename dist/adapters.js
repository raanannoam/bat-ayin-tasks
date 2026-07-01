"use strict";
var BatAyinAdapters = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/adaptersBundle.ts
  var adaptersBundle_exports = {};
  __export(adaptersBundle_exports, {
    BASE_CATEGORIES: () => BASE_CATEGORIES,
    BASE_PEOPLE: () => BASE_PEOPLE,
    DEFAULT_PREFS: () => DEFAULT_PREFS,
    DEMO_MANAGER_OWNER: () => DEMO_MANAGER_OWNER,
    DEMO_USER_OWNER: () => DEMO_USER_OWNER,
    PILOT_APP_URL: () => PILOT_APP_URL,
    PILOT_MIGRATION_STORAGE_KEY: () => PILOT_MIGRATION_STORAGE_KEY,
    PILOT_SUPABASE_ANON_KEY: () => PILOT_SUPABASE_ANON_KEY,
    PILOT_SUPABASE_URL: () => PILOT_SUPABASE_URL,
    SUPPLIER_STEPS: () => SUPPLIER_STEPS,
    ageLabel: () => ageLabel,
    allKnownPeople: () => allKnownPeople,
    buildManagementAssigneePriorityGroups: () => buildManagementAssigneePriorityGroups,
    buildManagementPriorityChronologicalGroups: () => buildManagementPriorityChronologicalGroups,
    buildManagementTaskAssignees: () => buildManagementTaskAssignees,
    buildTaskDueLabel: () => buildTaskDueLabel,
    canAccessOrgAdmin: () => canAccessOrgAdmin,
    canAccessSupplier: () => canAccessSupplier,
    canAccessTask: () => canAccessTask,
    canDeactivateMember: () => canDeactivateMember,
    canDeleteTask: () => canDeleteTask,
    canDemoteMember: () => canDemoteMember,
    canEditTaskContent: () => canEditTaskContent,
    canPromoteMember: () => canPromoteMember,
    canReactivateMember: () => canReactivateMember,
    countActiveManagers: () => countActiveManagers,
    createAsyncRepository: () => createAsyncRepository,
    createLocalOrgMembersAdapter: () => createLocalOrgMembersAdapter,
    createLocalSuppliersAdapter: () => createLocalSuppliersAdapter,
    createLocalTasksAdapter: () => createLocalTasksAdapter,
    createSupabaseOrgMembersAdapter: () => createSupabaseOrgMembersAdapter,
    createSupabaseSuppliersAdapter: () => createSupabaseSuppliersAdapter,
    createSupabaseTasksAdapter: () => createSupabaseTasksAdapter,
    dateFromIso: () => dateFromIso,
    daysBetween: () => daysBetween,
    daysFromTodayIso: () => daysFromTodayIso,
    defaultTaskReminder: () => defaultTaskReminder,
    ensurePilotProfile: () => ensurePilotProfile,
    filterActiveTasks: () => filterActiveTasks,
    filterManagementPeople: () => filterManagementPeople,
    filterOpenTasks: () => filterOpenTasks,
    filterPersonalTasks: () => filterPersonalTasks,
    filterVisibleDoneTasks: () => filterVisibleDoneTasks,
    filterVisibleSuppliers: () => filterVisibleSuppliers,
    findOrgMember: () => findOrgMember,
    findSupplier: () => findSupplier,
    findTask: () => findTask,
    findVisibleSupplier: () => findVisibleSupplier,
    findVisibleTask: () => findVisibleTask,
    formatHebrewDate: () => formatHebrewDate,
    getDateBucketFromIso: () => getDateBucketFromIso,
    getPilotOAuthRedirectUrl: () => getPilotOAuthRedirectUrl,
    isArchivedDone: () => isArchivedDone,
    isLastActiveManager: () => isLastActiveManager,
    isPersonalTask: () => isPersonalTask,
    isPilotDebugEnabled: () => isPilotDebugEnabled,
    isSupabasePlaceholder: () => isSupabasePlaceholder,
    isTaskOverdue: () => isTaskOverdue,
    isoDateFromOffset: () => isoDateFromOffset,
    lastManagerBlockReason: () => lastManagerBlockReason,
    loadCategories: () => loadCategories,
    loadPeople: () => loadPeople,
    loadPilotAuthContext: () => loadPilotAuthContext,
    loadPreferences: () => loadPreferences,
    loadSupabaseTasksWriteContext: () => loadSupabaseTasksWriteContext,
    mapAppTaskToSupabaseInsert: () => mapAppTaskToSupabaseInsert,
    migrateLocalPilotData: () => migrateLocalPilotData,
    normalizeSupplier: () => normalizeSupplier,
    normalizeTask: () => normalizeTask,
    orgMemberRoleLabel: () => orgMemberRoleLabel,
    personalOwner: () => personalOwner,
    priorityLabel: () => priorityLabel,
    readCustomCategories: () => readCustomCategories,
    readCustomPeople: () => readCustomPeople,
    readHiddenCategoryIds: () => readHiddenCategoryIds,
    readHiddenPeople: () => readHiddenPeople,
    relativeAgeLabel: () => relativeAgeLabel,
    resolveCategory: () => resolveCategory,
    resolveCurrentSort: () => resolveCurrentSort,
    resolvePilotDataBackend: () => resolvePilotDataBackend,
    safeArrayStorage: () => safeArrayStorage,
    safeObjectStorage: () => safeObjectStorage,
    safeParseStorage: () => safeParseStorage,
    saveCustomCategories: () => saveCustomCategories,
    saveCustomPeople: () => saveCustomPeople,
    saveHiddenCategoryIds: () => saveHiddenCategoryIds,
    saveHiddenPeople: () => saveHiddenPeople,
    savePreferences: () => savePreferences,
    sortOptions: () => sortOptions,
    sortOrgMembers: () => sortOrgMembers,
    sortTasks: () => sortTasks,
    startOfToday: () => startOfToday,
    supplierProgress: () => supplierProgress,
    taskDueRank: () => taskDueRank,
    taskGroupTitle: () => taskGroupTitle,
    toIsoDateOnly: () => toIsoDateOnly,
    writeStorageJson: () => writeStorageJson
  });

  // src/data/adapters/supabase/constants.ts
  var DEFAULT_ORGANIZATION_ID = "00000000-0000-0000-0000-000000000001";
  var NO_SUPABASE_AUTH_SESSION_REASON = "No Supabase auth session. Sign in first or provide a temporary debug login method outside committed code.";

  // src/data/adapters/supabase/groupTaskUpdatesByTaskId.ts
  function groupTaskUpdatesByTaskId(rows) {
    const grouped = /* @__PURE__ */ new Map();
    (rows || []).forEach((row) => {
      const list = grouped.get(row.task_id) || [];
      list.push(row);
      grouped.set(row.task_id, list);
    });
    return grouped;
  }

  // src/data/adapters/supabase/profileMaps.ts
  function buildCategorySlugById(rows) {
    return new Map((rows || []).map((row) => [row.id, row.slug]));
  }
  function buildCategoryIdBySlug(rows) {
    return new Map((rows || []).map((row) => [row.slug, row.id]));
  }
  function buildProfileNameById(rows) {
    return new Map((rows || []).map((row) => [row.id, row.display_name]));
  }
  function buildProfileIdByName(rows) {
    return new Map((rows || []).map((row) => [row.display_name, row.id]));
  }

  // src/data/adapters/supabase/loadSupabaseTasksReadContext.ts
  async function loadSupabaseTasksReadContext(client) {
    const batAyin = client.schema("bat_ayin");
    const [categoriesResult, membersResult] = await Promise.all([
      batAyin.from("categories").select("id, slug").eq("organization_id", DEFAULT_ORGANIZATION_ID).is("deleted_at", null),
      batAyin.from("organization_members").select("user_id").eq("organization_id", DEFAULT_ORGANIZATION_ID).eq("is_active", true)
    ]);
    if (categoriesResult.error) throw categoriesResult.error;
    if (membersResult.error) throw membersResult.error;
    const userIds = [...new Set((membersResult.data || []).map((row) => row.user_id))];
    let profileRows = [];
    if (userIds.length) {
      const profilesResult = await client.from("profiles").select("id, display_name").in("id", userIds);
      if (profilesResult.error) throw profilesResult.error;
      profileRows = profilesResult.data || [];
    }
    return {
      categorySlugById: buildCategorySlugById(categoriesResult.data),
      profileNameById: buildProfileNameById(profileRows)
    };
  }

  // src/data/shared/dateUtils.ts
  function startOfToday() {
    const date = /* @__PURE__ */ new Date();
    date.setHours(0, 0, 0, 0);
    return date;
  }
  function isoDateFromOffset(days) {
    const date = startOfToday();
    date.setDate(date.getDate() + days);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
  }
  function dateFromIso(value) {
    if (!value) return null;
    const date = /* @__PURE__ */ new Date(`${value}T12:00:00`);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  function toIsoDateOnly(value) {
    if (!value || typeof value !== "string") return null;
    const dateOnly = value.slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(dateOnly) ? dateOnly : null;
  }
  function getDateBucketFromIso(dueDate, status) {
    if (status === "done") return "done";
    const dueOnly = toIsoDateOnly(dueDate);
    if (!dueOnly) return "none";
    if (dueOnly === isoDateFromOffset(0)) return "today";
    if (dueOnly === isoDateFromOffset(1)) return "tomorrow";
    return "date";
  }
  function daysFromTodayIso(value) {
    const dueOnly = toIsoDateOnly(value);
    if (!dueOnly) return null;
    const due = dateFromIso(dueOnly);
    if (!due) return null;
    due.setHours(0, 0, 0, 0);
    return Math.floor((due.getTime() - startOfToday().getTime()) / 864e5);
  }
  function daysBetween(start, end = startOfToday()) {
    const startDate = dateFromIso(start);
    if (!startDate) return 0;
    startDate.setHours(0, 0, 0, 0);
    return Math.max(0, Math.floor((end.getTime() - startDate.getTime()) / 864e5));
  }

  // src/data/adapters/supabase/mapDbTaskUpdateToApp.ts
  function toDateOnly(value) {
    if (!value) return null;
    const text = String(value).slice(0, 10);
    return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
  }
  function mapDbTaskUpdateToApp(row, ctx) {
    return {
      by: ctx.profileNameById.get(row.author_id || "") || "\u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2",
      text: row.body || "",
      created_at: toDateOnly(row.created_at),
      notify_participants: Boolean(row.notify_participants),
      notification_status: row.notification_status || "pending"
    };
  }

  // src/data/adapters/supabase/mapDbTaskRowToApp.ts
  function toDateOnly2(value) {
    return toIsoDateOnly(value);
  }
  function mapDbTaskRowToApp(row, ctx, updateRows) {
    const dueDate = row.due_date || null;
    return {
      id: String(row.id),
      title: row.title || "",
      notes: row.notes || "",
      status: row.status === "done" ? "done" : "progress",
      priority: row.priority === "high" ? "high" : "normal",
      category: ctx.categorySlugById.get(row.category_id || "") || "office",
      assigneeId: row.assignee_id || void 0,
      owner: ctx.profileNameById.get(row.assignee_id || "") || "\u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2",
      due_date: dueDate,
      dueLabel: row.due_label ?? null,
      due: getDateBucketFromIso(dueDate, row.status),
      reminder: row.reminder || { enabled: false },
      created_at: toDateOnly2(row.created_at),
      completed_at: toDateOnly2(row.completed_at),
      deleted_at: toDateOnly2(row.deleted_at),
      deleted_by: row.deleted_by ? ctx.profileNameById.get(row.deleted_by) || null : null,
      updates: (updateRows || []).map((updateRow) => mapDbTaskUpdateToApp(updateRow, ctx))
    };
  }

  // src/data/shared/defaultTaskReminder.ts
  function defaultTaskReminder(task) {
    return {
      enabled: Boolean(task.due_date),
      timing: "before_due",
      amount: 1,
      unit: "day"
    };
  }

  // src/data/shared/normalizeTask.ts
  function normalizeUpdate(update, taskIndex, updateIndex) {
    return {
      by: update.by || "\u05E2\u05D3\u05D9\u05E0\u05D4",
      text: update.text || "",
      created_at: update.created_at || isoDateFromOffset(-(taskIndex + updateIndex + 1)),
      notify_participants: Boolean(update.notify_participants),
      notification_status: update.notification_status || "pending"
    };
  }
  function normalizeTask(task, index) {
    const dueDefaults = {
      today: isoDateFromOffset(0),
      tomorrow: isoDateFromOffset(1),
      date: isoDateFromOffset(12)
    };
    const dueDate = task.status === "done" || task.due === "done" || task.due === "none" ? null : task.due_date || dueDefaults[task.due || ""] || null;
    const updates = Array.isArray(task.updates) ? task.updates.map(
      (update, updateIndex) => normalizeUpdate(update, index, updateIndex)
    ) : [];
    return {
      priority: index % 5 === 0 ? "high" : "normal",
      created_at: task.created_at || isoDateFromOffset(-(index + 1)),
      ...task,
      due_date: dueDate,
      due: task.due || (dueDate ? "date" : "none"),
      completed_at: task.status === "done" ? task.completed_at || task.created_at || isoDateFromOffset(-(index + 1)) : null,
      deleted_at: task.deleted_at || null,
      deleted_by: task.deleted_by || null,
      reminder: task.reminder || defaultTaskReminder({ ...task, due_date: dueDate }),
      updates
    };
  }

  // src/data/adapters/supabase/supabaseTasksReadAdapter.ts
  function createSupabaseTasksReadAdapter(client) {
    return {
      async loadTasks() {
        if (!client) {
          throw new Error("Supabase is not configured.");
        }
        const { data: authData, error: authError } = await client.auth.getSession();
        if (authError) throw authError;
        if (!authData.session) {
          throw new Error(NO_SUPABASE_AUTH_SESSION_REASON);
        }
        const batAyin = client.schema("bat_ayin");
        const ctx = await loadSupabaseTasksReadContext(client);
        const tasksResult = await batAyin.from("tasks").select(
          "id, title, notes, status, priority, due_date, due_label, reminder, created_at, completed_at, deleted_at, category_id, assignee_id, deleted_by"
        ).eq("organization_id", DEFAULT_ORGANIZATION_ID).is("deleted_at", null).order("created_at", { ascending: false });
        if (tasksResult.error) throw tasksResult.error;
        const updatesResult = await batAyin.from("task_updates").select("task_id, author_id, body, created_at, notify_participants, notification_status").eq("organization_id", DEFAULT_ORGANIZATION_ID).is("deleted_at", null).order("created_at", { ascending: true });
        if (updatesResult.error) throw updatesResult.error;
        const updatesByTaskId = groupTaskUpdatesByTaskId(updatesResult.data);
        return (tasksResult.data || []).map(
          (row, index) => normalizeTask(mapDbTaskRowToApp(row, ctx, updatesByTaskId.get(row.id) || []), index)
        );
      }
    };
  }

  // src/data/adapters/supabase/fetchSupabaseTaskById.ts
  async function fetchSupabaseTaskById(client, taskId, options = {}) {
    const ctx = await loadSupabaseTasksReadContext(client);
    const batAyin = client.schema("bat_ayin");
    let taskQuery = batAyin.from("tasks").select(
      "id, title, notes, status, priority, due_date, due_label, reminder, created_at, completed_at, deleted_at, category_id, assignee_id, deleted_by"
    ).eq("id", taskId).eq("organization_id", DEFAULT_ORGANIZATION_ID);
    if (!options.includeDeleted) {
      taskQuery = taskQuery.is("deleted_at", null);
    }
    const taskResult = await taskQuery.single();
    if (taskResult.error) throw taskResult.error;
    const updatesResult = await batAyin.from("task_updates").select("author_id, body, created_at, notify_participants, notification_status").eq("task_id", taskId).eq("organization_id", DEFAULT_ORGANIZATION_ID).is("deleted_at", null).order("created_at", { ascending: true });
    if (updatesResult.error) throw updatesResult.error;
    return normalizeTask(mapDbTaskRowToApp(taskResult.data, ctx, updatesResult.data || []));
  }

  // src/data/adapters/supabase/loadSupabaseTasksWriteContext.ts
  async function loadSupabaseTasksWriteContext(client) {
    try {
      if (!client) {
        return { ok: false, reason: "Supabase is not configured.", code: "supabase_not_configured" };
      }
      const { data: authData, error: authError } = await client.auth.getSession();
      if (authError) {
        return {
          ok: false,
          reason: authError.message || "Auth check failed.",
          code: "auth_check_failed",
          error: authError
        };
      }
      if (!authData.session) {
        return { ok: false, reason: NO_SUPABASE_AUTH_SESSION_REASON, code: "auth_session_missing" };
      }
      const authUserId = authData.session.user.id;
      const batAyin = client.schema("bat_ayin");
      const [categoriesResult, membersResult] = await Promise.all([
        batAyin.from("categories").select("id, slug, name, icon, sort_order").eq("organization_id", DEFAULT_ORGANIZATION_ID).eq("is_active", true).is("deleted_at", null).order("sort_order", { ascending: true }),
        batAyin.from("organization_members").select("user_id, role, is_active").eq("organization_id", DEFAULT_ORGANIZATION_ID).eq("is_active", true)
      ]);
      if (categoriesResult.error) {
        return {
          ok: false,
          reason: categoriesResult.error.message || String(categoriesResult.error),
          code: "categories_load_failed",
          error: categoriesResult.error
        };
      }
      if (membersResult.error) {
        return {
          ok: false,
          reason: membersResult.error.message || String(membersResult.error),
          code: "members_load_failed",
          error: membersResult.error
        };
      }
      const members = membersResult.data || [];
      const currentMember = members.find((row) => row.user_id === authUserId);
      if (!currentMember) {
        return {
          ok: false,
          reason: "Signed-in user is not an active member of this organization.",
          code: "not_org_member"
        };
      }
      const userIds = [...new Set(members.map((row) => row.user_id))];
      let profileRows = [];
      if (userIds.length) {
        const profilesResult = await client.from("profiles").select("id, display_name").in("id", userIds);
        if (profilesResult.error) {
          return {
            ok: false,
            reason: profilesResult.error.message || String(profilesResult.error),
            code: "profiles_load_failed",
            error: profilesResult.error
          };
        }
        profileRows = profilesResult.data || [];
      }
      const profileIdByName = buildProfileIdByName(profileRows);
      const categoryRows = categoriesResult.data || [];
      const categoryCatalog = categoryRows.map((row) => ({
        id: row.slug,
        label: row.name,
        icon: row.icon || "office"
      }));
      return {
        ok: true,
        ctx: {
          organizationId: DEFAULT_ORGANIZATION_ID,
          authUserId,
          authUserRole: currentMember.role === "manager" ? "manager" : "user",
          categoryIdBySlug: buildCategoryIdBySlug(categoryRows),
          categoryCatalog,
          profileIdByName,
          profileNameById: buildProfileNameById(profileRows),
          allowedAssigneeIds: new Set(userIds),
          allowedOwnerNames: new Set(profileIdByName.keys())
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, reason: message, code: "unexpected_error", error };
    }
  }

  // src/data/adapters/supabase/mapAppTaskPatchToSupabaseUpdate.ts
  function toDbTimestamp(value) {
    const dateOnly = toIsoDateOnly(value);
    if (!dateOnly) return null;
    return `${dateOnly}T12:00:00.000Z`;
  }
  function mapAppTaskPatchToSupabaseUpdate(patch, writeCtx) {
    const payload = {};
    if ("title" in patch) {
      payload.title = String(patch.title ?? "").trim();
    }
    if ("notes" in patch) {
      payload.notes = patch.notes ?? "";
    }
    if ("status" in patch) {
      payload.status = patch.status === "done" ? "done" : "progress";
    }
    if ("priority" in patch) {
      payload.priority = patch.priority === "high" ? "high" : "normal";
    }
    if ("due_date" in patch || "dueDate" in patch) {
      payload.due_date = patch.due_date ?? patch.dueDate ?? null;
    }
    if ("dueLabel" in patch) {
      payload.due_label = patch.dueLabel ?? null;
    }
    if ("reminder" in patch) {
      payload.reminder = patch.reminder ?? { enabled: false };
    }
    if ("category" in patch) {
      const category = patch.category;
      if (!category || category === "uncategorized") {
        payload.category_id = null;
      } else {
        const categoryId = writeCtx.categoryIdBySlug.get(category);
        if (!categoryId) {
          return { ok: false, code: "category_not_found" };
        }
        payload.category_id = categoryId;
      }
    }
    if ("owner" in patch) {
      const ownerName = String(patch.owner ?? "").trim();
      if (!ownerName) {
        return { ok: false, code: "owner_missing", reason: "Task owner is required." };
      }
      const assigneeId = writeCtx.profileIdByName.get(ownerName);
      if (!assigneeId) {
        return { ok: false, code: "owner_not_found", reason: "Owner name does not exist in Supabase member map." };
      }
      if (!writeCtx.allowedAssigneeIds.has(assigneeId)) {
        return { ok: false, code: "owner_not_allowed" };
      }
      payload.assignee_id = assigneeId;
    }
    if ("deleted_at" in patch) {
      payload.deleted_at = patch.deleted_at ? toDbTimestamp(patch.deleted_at) ?? toDbTimestamp(isoDateFromOffset(0)) : null;
    }
    if ("deleted_by" in patch) {
      if (!patch.deleted_by) {
        payload.deleted_by = null;
      } else {
        const deletedById = writeCtx.profileIdByName.get(String(patch.deleted_by).trim());
        if (!deletedById) {
          return { ok: false, code: "deleted_by_not_found", reason: "Deleted-by name does not exist in Supabase member map." };
        }
        payload.deleted_by = deletedById;
      }
    }
    if ("completed_at" in patch) {
      payload.completed_at = patch.completed_at ? toDbTimestamp(patch.completed_at) : null;
    }
    return { ok: true, payload };
  }

  // src/data/adapters/supabase/syncAppTaskUpdates.ts
  async function insertAppTaskUpdates(client, taskId, updates, writeCtx) {
    if (!updates.length) return;
    const rows = updates.map((update) => {
      const authorName = String(update.by ?? "").trim();
      const authorId = writeCtx.profileIdByName.get(authorName);
      if (!authorId) {
        throw new Error(`Update author not found: ${authorName}`);
      }
      return {
        organization_id: writeCtx.organizationId,
        task_id: taskId,
        author_id: authorId,
        body: update.text ?? "",
        notify_participants: Boolean(update.notify_participants),
        notification_status: update.notification_status || "pending"
      };
    });
    const { error } = await client.schema("bat_ayin").from("task_updates").insert(rows);
    if (error) throw error;
  }
  async function syncEditedTaskUpdatesByIndex(client, taskId, previous, next, writeCtx) {
    if (previous.length !== next.length) return;
    const batAyin = client.schema("bat_ayin");
    const rowsResult = await batAyin.from("task_updates").select("id").eq("task_id", taskId).eq("organization_id", writeCtx.organizationId).is("deleted_at", null).order("created_at", { ascending: true });
    if (rowsResult.error) throw rowsResult.error;
    const rows = rowsResult.data || [];
    for (let index = 0; index < next.length; index += 1) {
      if (previous[index]?.text === next[index]?.text) continue;
      const rowId = rows[index]?.id;
      if (!rowId) continue;
      const { error } = await batAyin.from("task_updates").update({ body: next[index]?.text || "" }).eq("id", rowId);
      if (error) throw error;
    }
  }
  async function syncAppTaskUpdates(client, taskId, previous, next, writeCtx) {
    const prev = Array.isArray(previous) ? previous : [];
    const nxt = Array.isArray(next) ? next : [];
    if (nxt.length > prev.length) {
      await insertAppTaskUpdates(client, taskId, nxt.slice(prev.length), writeCtx);
    }
    await syncEditedTaskUpdatesByIndex(client, taskId, prev, nxt, writeCtx);
  }

  // src/data/adapters/supabase/applySupabaseTaskPatch.ts
  async function applySupabaseTaskPatch(client, tasks, id, patch) {
    if (!client) {
      throw new Error("Supabase is not configured.");
    }
    const existing = tasks.find((task) => task.id === id);
    if (!existing) return tasks;
    const contextResult = await loadSupabaseTasksWriteContext(client);
    if (!contextResult.ok) {
      throw new Error(contextResult.reason || contextResult.code || "Write context load failed.");
    }
    const mapResult = mapAppTaskPatchToSupabaseUpdate(patch, contextResult.ctx);
    if (!mapResult.ok) {
      throw new Error(mapResult.reason || mapResult.code || "Task patch mapping failed.");
    }
    const payload = mapResult.payload;
    if (Object.keys(payload).length > 0) {
      const { error } = await client.schema("bat_ayin").from("tasks").update(payload).eq("id", id).eq("organization_id", contextResult.ctx.organizationId);
      if (error) throw error;
    }
    if ("updates" in patch) {
      await syncAppTaskUpdates(client, id, existing.updates, patch.updates, contextResult.ctx);
    }
    const updatedTask = await fetchSupabaseTaskById(client, id, {
      includeDeleted: Boolean(patch.deleted_at)
    });
    return tasks.map((task) => task.id === id ? updatedTask : task);
  }
  function buildCompleteTaskPatch(task) {
    return {
      status: "done",
      due: "done",
      due_date: null,
      dueLabel: "\u05D4\u05D5\u05E9\u05DC\u05DD \xB7 \u05D4\u05D9\u05D5\u05DD",
      completed_at: isoDateFromOffset(0),
      reminder: { ...task.reminder || { enabled: false }, enabled: false }
    };
  }
  function buildReopenTaskPatch(task) {
    const dueDate = task.due === "done" ? isoDateFromOffset(0) : task.due_date ?? null;
    return {
      status: "progress",
      due: task.due === "done" ? "today" : task.due,
      due_date: dueDate,
      dueLabel: task.due === "done" ? "\u05D4\u05D9\u05D5\u05DD \xB7 \u05E9\u05DC\u05D9\u05E9\u05D9" : task.dueLabel ?? null,
      completed_at: null,
      reminder: defaultTaskReminder({ ...task, due_date: dueDate })
    };
  }
  function buildDeleteTaskSoftPatch(deletedBy) {
    return {
      deleted_at: isoDateFromOffset(0),
      deleted_by: deletedBy
    };
  }

  // src/data/adapters/supabase/mapAppTaskToSupabaseInsert.ts
  function mapAppTaskToSupabaseInsert(appTask, writeCtx) {
    const title = String(appTask?.title ?? "").trim();
    if (!title) {
      return { ok: false, code: "title_missing" };
    }
    const owner = appTask?.owner;
    if (owner == null || String(owner).trim() === "") {
      return { ok: false, code: "owner_missing", reason: "Task owner is required." };
    }
    const ownerName = String(owner).trim();
    const assigneeId = writeCtx.profileIdByName.get(ownerName);
    if (!assigneeId) {
      return {
        ok: false,
        code: "owner_not_found",
        reason: "Owner name does not exist in Supabase member map."
      };
    }
    if (!writeCtx.allowedAssigneeIds.has(assigneeId)) {
      return { ok: false, code: "owner_not_allowed" };
    }
    const category = appTask?.category;
    let categoryId = null;
    if (category && category !== "uncategorized") {
      categoryId = writeCtx.categoryIdBySlug.get(category) ?? null;
    }
    const dueDate = appTask?.dueDate ?? appTask?.due_date ?? null;
    const dueLabel = appTask?.dueLabel ?? null;
    return {
      ok: true,
      payload: {
        organization_id: writeCtx.organizationId,
        category_id: categoryId,
        assignee_id: assigneeId,
        created_by: writeCtx.authUserId,
        title,
        notes: appTask?.notes ?? "",
        status: appTask?.status === "done" ? "done" : "progress",
        priority: appTask?.priority === "high" ? "high" : "normal",
        due_date: dueDate,
        due_label: dueLabel,
        reminder: appTask?.reminder ?? { enabled: false }
      }
    };
  }

  // src/data/adapters/supabase/supabaseTasksWriteAdapter.ts
  function createSupabaseTasksWriteAdapter(client) {
    return {
      async createTask(tasks, appTask) {
        if (!client) {
          throw new Error("Supabase is not configured.");
        }
        const contextResult = await loadSupabaseTasksWriteContext(client);
        if (!contextResult.ok) {
          throw new Error(contextResult.reason || contextResult.code || "Write context load failed.");
        }
        const mapperResult = mapAppTaskToSupabaseInsert(appTask, contextResult.ctx);
        if (!mapperResult.ok) {
          throw new Error(mapperResult.reason || mapperResult.code || "Task mapping failed.");
        }
        const { data, error } = await client.schema("bat_ayin").from("tasks").insert(mapperResult.payload).select().single();
        if (error) throw error;
        const readCtx = await loadSupabaseTasksReadContext(client);
        const createdTask = normalizeTask(mapDbTaskRowToApp(data, readCtx));
        return [createdTask, ...tasks || []];
      },
      updateTask(tasks, id, patch) {
        return applySupabaseTaskPatch(client, tasks, id, patch);
      },
      deleteTaskSoft(tasks, id, deletedBy) {
        return applySupabaseTaskPatch(client, tasks, id, buildDeleteTaskSoftPatch(deletedBy));
      },
      completeTask(tasks, id) {
        const task = tasks.find((item) => item.id === id);
        if (!task) return Promise.resolve(tasks);
        return applySupabaseTaskPatch(client, tasks, id, buildCompleteTaskPatch(task));
      },
      reopenTask(tasks, id) {
        const task = tasks.find((item) => item.id === id);
        if (!task) return Promise.resolve(tasks);
        return applySupabaseTaskPatch(client, tasks, id, buildReopenTaskPatch(task));
      }
    };
  }

  // src/data/adapters/supabase/supabaseTasksAdapter.ts
  function createSupabaseTasksAdapter(client) {
    const readAdapter = createSupabaseTasksReadAdapter(client);
    const writeAdapter = createSupabaseTasksWriteAdapter(client);
    return {
      loadTasks() {
        return readAdapter.loadTasks();
      },
      saveTasks(tasks) {
        return tasks;
      },
      createTask(tasks, appTask) {
        return writeAdapter.createTask(tasks, appTask);
      },
      updateTask(tasks, id, patch) {
        return writeAdapter.updateTask(tasks, id, patch);
      },
      deleteTaskSoft(tasks, id, deletedBy) {
        return writeAdapter.deleteTaskSoft(tasks, id, deletedBy);
      },
      completeTask(tasks, id) {
        return writeAdapter.completeTask(tasks, id);
      },
      reopenTask(tasks, id) {
        return writeAdapter.reopenTask(tasks, id);
      }
    };
  }

  // src/data/adapters/supabase/groupLinksByOrderId.ts
  function groupLinksByOrderId(rows) {
    const grouped = /* @__PURE__ */ new Map();
    (rows || []).forEach((row) => {
      if (!row.url) return;
      const list = grouped.get(row.supplier_order_id) || [];
      list.push(row.url);
      grouped.set(row.supplier_order_id, list);
    });
    return grouped;
  }

  // src/data/adapters/supabase/loadSupabaseSuppliersReadContext.ts
  async function loadSupabaseSuppliersReadContext(client) {
    const batAyin = client.schema("bat_ayin");
    const membersResult = await batAyin.from("organization_members").select("user_id").eq("organization_id", DEFAULT_ORGANIZATION_ID).eq("is_active", true);
    if (membersResult.error) throw membersResult.error;
    const userIds = [...new Set((membersResult.data || []).map((row) => row.user_id))];
    let profileRows = [];
    if (userIds.length) {
      const profilesResult = await client.from("profiles").select("id, display_name").in("id", userIds);
      if (profilesResult.error) throw profilesResult.error;
      profileRows = profilesResult.data || [];
    }
    return { profileNameById: buildProfileNameById(profileRows) };
  }

  // src/data/types/appSupplier.ts
  var SUPPLIER_STEP_IDS = ["order", "received", "payment", "invoice"];

  // src/data/adapters/supabase/supplierStepMaps.ts
  var STEP_DB_COLUMNS = {
    order: { completed: "order_completed", completedAt: "order_completed_at" },
    received: { completed: "received_completed", completedAt: "received_completed_at" },
    payment: { completed: "payment_completed", completedAt: "payment_completed_at" },
    invoice: { completed: "invoice_completed", completedAt: "invoice_completed_at" }
  };
  function dbDateToApp(value) {
    return toIsoDateOnly(typeof value === "string" ? value : null) ?? "";
  }
  function appDateToDb(value) {
    return toIsoDateOnly(value) ?? null;
  }
  function emptySupplierSteps() {
    return SUPPLIER_STEP_IDS.reduce((acc, step) => {
      acc[step] = false;
      return acc;
    }, {});
  }
  function emptySupplierStepDates() {
    return SUPPLIER_STEP_IDS.reduce((acc, step) => {
      acc[step] = "";
      return acc;
    }, {});
  }
  function mapDbRowToSupplierSteps(row) {
    const steps = emptySupplierSteps();
    const step_dates = emptySupplierStepDates();
    for (const step of SUPPLIER_STEP_IDS) {
      const cols = STEP_DB_COLUMNS[step];
      steps[step] = Boolean(row[cols.completed]);
      step_dates[step] = dbDateToApp(row[cols.completedAt]);
    }
    return { steps, step_dates };
  }
  function mapSupplierStepsToDb(steps, stepDates) {
    return {
      order_completed: Boolean(steps.order),
      order_completed_at: appDateToDb(stepDates.order),
      received_completed: Boolean(steps.received),
      received_completed_at: appDateToDb(stepDates.received),
      payment_completed: Boolean(steps.payment),
      payment_completed_at: appDateToDb(stepDates.payment),
      invoice_completed: Boolean(steps.invoice),
      invoice_completed_at: appDateToDb(stepDates.invoice)
    };
  }
  function buildSupplierStageUpdatePayload(step, checked, dateValue) {
    if (!SUPPLIER_STEP_IDS.includes(step)) return null;
    const cols = STEP_DB_COLUMNS[step];
    const nextChecked = dateValue ? true : checked;
    const payload = {
      [cols.completed]: nextChecked
    };
    if (dateValue !== null && dateValue !== void 0) {
      payload[cols.completedAt] = appDateToDb(dateValue);
    }
    return payload;
  }
  function buildMarkAllSupplierStagesPayload(stepDates) {
    const today = isoDateFromOffset(0);
    const steps = SUPPLIER_STEP_IDS.reduce((acc, step) => {
      acc[step] = true;
      return acc;
    }, {});
    const nextDates = SUPPLIER_STEP_IDS.reduce((acc, step) => {
      acc[step] = stepDates[step] || today;
      return acc;
    }, {});
    return mapSupplierStepsToDb(steps, nextDates);
  }

  // src/data/adapters/supabase/mapDbSupplierOrderRowToApp.ts
  function mapDbSupplierOrderRowToApp(row, ctx, links = []) {
    const { steps, step_dates } = mapDbRowToSupplierSteps(row);
    const assigneeIds = Array.isArray(row.assignee_ids) ? row.assignee_ids : [];
    const assignees = row.all_assignees ? [] : assigneeIds.map((id) => ctx.profileNameById.get(id)).filter((name) => Boolean(name));
    const deletedById = typeof row.deleted_by === "string" ? row.deleted_by : null;
    return {
      id: String(row.id),
      supplier: String(row.supplier_name ?? "\u05E1\u05E4\u05E7 \u05DC\u05DC\u05D0 \u05E9\u05DD"),
      description: String(row.description ?? ""),
      amount: String(row.amount_text ?? ""),
      due_date: toIsoDateOnly(typeof row.due_date === "string" ? row.due_date : null) ?? "",
      notes: String(row.notes ?? ""),
      document_notes: String(row.document_notes ?? ""),
      links: links.filter(Boolean),
      assignees,
      allAssignees: Boolean(row.all_assignees),
      steps,
      step_dates,
      created_at: toIsoDateOnly(typeof row.created_at === "string" ? row.created_at : null) ?? "",
      deleted_at: row.deleted_at ? toIsoDateOnly(String(row.deleted_at)) : null,
      deleted_by: deletedById ? ctx.profileNameById.get(deletedById) ?? null : null
    };
  }

  // src/data/adapters/supabase/fetchSupabaseSupplierOrderById.ts
  var ORDER_SELECT = "id, supplier_name, description, amount_text, due_date, notes, document_notes, all_assignees, assignee_ids, order_completed, order_completed_at, received_completed, received_completed_at, payment_completed, payment_completed_at, invoice_completed, invoice_completed_at, created_at, deleted_at, deleted_by";
  async function fetchSupabaseSupplierOrderById(client, orderId, options = {}) {
    const ctx = await loadSupabaseSuppliersReadContext(client);
    const batAyin = client.schema("bat_ayin");
    let orderQuery = batAyin.from("supplier_orders").select(ORDER_SELECT).eq("id", orderId).eq("organization_id", DEFAULT_ORGANIZATION_ID);
    if (!options.includeDeleted) {
      orderQuery = orderQuery.is("deleted_at", null);
    }
    const orderResult = await orderQuery.single();
    if (orderResult.error) throw orderResult.error;
    const linksResult = await batAyin.from("supplier_order_links").select("url").eq("supplier_order_id", orderId).eq("organization_id", DEFAULT_ORGANIZATION_ID).is("deleted_at", null);
    if (linksResult.error) throw linksResult.error;
    const links = (linksResult.data || []).map((row) => row.url).filter(Boolean);
    return mapDbSupplierOrderRowToApp(orderResult.data, ctx, links);
  }

  // src/data/adapters/supabase/supabaseSuppliersReadAdapter.ts
  function createSupabaseSuppliersReadAdapter(client) {
    return {
      async loadSuppliers() {
        if (!client) throw new Error("Supabase is not configured.");
        const { data: authData, error: authError } = await client.auth.getSession();
        if (authError) throw authError;
        if (!authData.session) throw new Error(NO_SUPABASE_AUTH_SESSION_REASON);
        const batAyin = client.schema("bat_ayin");
        const ctx = await loadSupabaseSuppliersReadContext(client);
        const ordersResult = await batAyin.from("supplier_orders").select(ORDER_SELECT).eq("organization_id", DEFAULT_ORGANIZATION_ID).is("deleted_at", null).order("created_at", { ascending: false });
        if (ordersResult.error) throw ordersResult.error;
        const orderRows = ordersResult.data || [];
        if (!orderRows.length) return [];
        const orderIds = orderRows.map((row) => row.id);
        const linksResult = await batAyin.from("supplier_order_links").select("supplier_order_id, url").in("supplier_order_id", orderIds).eq("organization_id", DEFAULT_ORGANIZATION_ID).is("deleted_at", null);
        if (linksResult.error) throw linksResult.error;
        const linksByOrderId = groupLinksByOrderId(linksResult.data);
        return orderRows.map(
          (row) => mapDbSupplierOrderRowToApp(row, ctx, linksByOrderId.get(row.id) || [])
        );
      }
    };
  }

  // src/data/adapters/supabase/loadSupabaseSuppliersWriteContext.ts
  async function loadSupabaseSuppliersWriteContext(client) {
    try {
      if (!client) {
        return { ok: false, reason: "Supabase is not configured.", code: "supabase_not_configured" };
      }
      const { data: authData, error: authError } = await client.auth.getSession();
      if (authError) {
        return {
          ok: false,
          reason: authError.message || "Auth check failed.",
          code: "auth_check_failed",
          error: authError
        };
      }
      if (!authData.session) {
        return { ok: false, reason: NO_SUPABASE_AUTH_SESSION_REASON, code: "auth_session_missing" };
      }
      const authUserId = authData.session.user.id;
      const membersResult = await client.schema("bat_ayin").from("organization_members").select("user_id, role, is_active").eq("organization_id", DEFAULT_ORGANIZATION_ID).eq("is_active", true);
      if (membersResult.error) {
        return {
          ok: false,
          reason: membersResult.error.message || String(membersResult.error),
          code: "members_load_failed",
          error: membersResult.error
        };
      }
      const members = membersResult.data || [];
      const currentMember = members.find((row) => row.user_id === authUserId);
      if (!currentMember) {
        return {
          ok: false,
          reason: "Signed-in user is not an active member of this organization.",
          code: "not_org_member"
        };
      }
      const userIds = [...new Set(members.map((row) => row.user_id))];
      let profileRows = [];
      if (userIds.length) {
        const profilesResult = await client.from("profiles").select("id, display_name").in("id", userIds);
        if (profilesResult.error) {
          return {
            ok: false,
            reason: profilesResult.error.message || String(profilesResult.error),
            code: "profiles_load_failed",
            error: profilesResult.error
          };
        }
        profileRows = profilesResult.data || [];
      }
      const profileIdByName = buildProfileIdByName(profileRows);
      return {
        ok: true,
        ctx: {
          organizationId: DEFAULT_ORGANIZATION_ID,
          authUserId,
          authUserRole: currentMember.role === "manager" ? "manager" : "user",
          profileIdByName,
          profileNameById: buildProfileNameById(profileRows),
          allowedAssigneeIds: new Set(userIds)
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, reason: message, code: "unexpected_error", error };
    }
  }

  // src/data/adapters/supabase/mapAppSupplierOrderToInsert.ts
  function mapAssigneesToDb(app, writeCtx) {
    if (app.allAssignees) {
      return { ok: true, all_assignees: true, assignee_ids: [] };
    }
    const assigneeIds = [];
    for (const name of app.assignees || []) {
      const trimmed = String(name).trim();
      const profileId = writeCtx.profileIdByName.get(trimmed);
      if (!profileId) {
        return {
          ok: false,
          code: "assignee_not_found",
          reason: `Assignee "${trimmed}" does not exist in Supabase member map.`
        };
      }
      if (!writeCtx.allowedAssigneeIds.has(profileId)) {
        return { ok: false, code: "assignee_not_allowed" };
      }
      assigneeIds.push(profileId);
    }
    if (!assigneeIds.length) {
      return {
        ok: false,
        code: "assignees_missing",
        reason: "At least one assignee is required when allAssignees is false."
      };
    }
    return { ok: true, all_assignees: false, assignee_ids: assigneeIds };
  }
  function mapAppSupplierOrderToInsert(app, writeCtx) {
    const supplierName = String(app.supplier ?? "").trim();
    if (!supplierName) {
      return { ok: false, code: "supplier_name_missing" };
    }
    const assigneeResult = mapAssigneesToDb(app, writeCtx);
    if (!assigneeResult.ok) {
      return { ok: false, code: assigneeResult.code, reason: assigneeResult.reason };
    }
    return {
      ok: true,
      links: (app.links || []).filter(Boolean),
      payload: {
        organization_id: writeCtx.organizationId,
        supplier_id: null,
        created_by: writeCtx.authUserId,
        supplier_name: supplierName,
        description: app.description ?? "",
        amount_text: app.amount ?? "",
        due_date: toIsoDateOnly(app.due_date) ?? null,
        notes: app.notes ?? "",
        document_notes: app.document_notes ?? "",
        all_assignees: assigneeResult.all_assignees,
        assignee_ids: assigneeResult.assignee_ids,
        ...mapSupplierStepsToDb(app.steps, app.step_dates)
      }
    };
  }
  function mapAppSupplierToSupabaseUpdate(app, writeCtx) {
    const assigneeResult = mapAssigneesToDb(app, writeCtx);
    if (!assigneeResult.ok) {
      return { ok: false, code: assigneeResult.code, reason: assigneeResult.reason };
    }
    return {
      ok: true,
      payload: {
        supplier_name: String(app.supplier ?? "").trim(),
        description: app.description ?? "",
        amount_text: app.amount ?? "",
        due_date: toIsoDateOnly(app.due_date) ?? null,
        notes: app.notes ?? "",
        document_notes: app.document_notes ?? "",
        all_assignees: assigneeResult.all_assignees,
        assignee_ids: assigneeResult.assignee_ids,
        ...mapSupplierStepsToDb(app.steps, app.step_dates)
      },
      links: (app.links || []).filter(Boolean)
    };
  }

  // src/data/adapters/supabase/syncSupplierOrderLinks.ts
  async function syncSupplierOrderLinks(client, orderId, links) {
    const batAyin = client.schema("bat_ayin");
    const existingResult = await batAyin.from("supplier_order_links").select("id").eq("supplier_order_id", orderId).eq("organization_id", DEFAULT_ORGANIZATION_ID).is("deleted_at", null);
    if (existingResult.error) throw existingResult.error;
    const existingIds = (existingResult.data || []).map((row) => row.id);
    for (const id of existingIds) {
      const { error } = await batAyin.rpc("soft_delete_supplier_order_link", { p_link_id: id });
      if (error) throw error;
    }
    const nextLinks = [...new Set(links.filter(Boolean))];
    if (!nextLinks.length) return;
    const rows = nextLinks.map((url) => ({
      organization_id: DEFAULT_ORGANIZATION_ID,
      supplier_order_id: orderId,
      url,
      link_type: "link"
    }));
    const { error: insertError } = await batAyin.from("supplier_order_links").insert(rows);
    if (insertError) throw insertError;
  }
  async function insertSupplierOrderLinks(client, orderId, links) {
    const nextLinks = [...new Set(links.filter(Boolean))];
    if (!nextLinks.length) return;
    const rows = nextLinks.map((url) => ({
      organization_id: DEFAULT_ORGANIZATION_ID,
      supplier_order_id: orderId,
      url,
      link_type: "link"
    }));
    const { error } = await client.schema("bat_ayin").from("supplier_order_links").insert(rows);
    if (error) throw error;
  }

  // src/data/adapters/supabase/applySupabaseSupplierUpdate.ts
  async function applySupabaseSupplierUpdate(client, suppliers, id, next, options = {}) {
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
    const { error } = await client.schema("bat_ayin").from("supplier_orders").update(mapResult.payload).eq("id", id).eq("organization_id", contextResult.ctx.organizationId);
    if (error) throw error;
    if (options.syncLinks !== false) {
      await syncSupplierOrderLinks(client, id, mapResult.links);
    }
    const updated = await fetchSupabaseSupplierOrderById(client, id, {
      includeDeleted: options.includeDeleted
    });
    return suppliers.map((item) => item.id === id ? updated : item);
  }
  async function applySupabaseSupplierSoftDelete(client, suppliers, id, deletedBy) {
    if (!client) throw new Error("Supabase is not configured.");
    const existing = suppliers.find((item) => item.id === id);
    if (!existing) return suppliers;
    const contextResult = await loadSupabaseSuppliersWriteContext(client);
    if (!contextResult.ok) {
      throw new Error(contextResult.reason || contextResult.code || "Write context load failed.");
    }
    const { error } = await client.schema("bat_ayin").rpc("soft_delete_supplier_order", { p_order_id: id });
    if (error) throw error;
    return suppliers.filter((item) => item.id !== id);
  }

  // src/data/adapters/supabase/supabaseSuppliersWriteAdapter.ts
  function resolveSupplierPatch(existing, patchOrUpdater) {
    return typeof patchOrUpdater === "function" ? patchOrUpdater(existing) : { ...existing, ...patchOrUpdater };
  }
  function createSupabaseSuppliersWriteAdapter(client) {
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
        const { data, error } = await client.schema("bat_ayin").from("supplier_orders").insert(mapResult.payload).select().single();
        if (error) throw error;
        await insertSupplierOrderLinks(client, data.id, mapResult.links);
        const created = await fetchSupabaseSupplierOrderById(client, data.id);
        return [created, ...suppliers || []];
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
        const { error } = await client.schema("bat_ayin").from("supplier_orders").update(payload).eq("id", id).eq("organization_id", contextResult.ctx.organizationId);
        if (error) throw error;
        const updated = await fetchSupabaseSupplierOrderById(client, id);
        return suppliers.map((item) => item.id === id ? updated : item);
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
        const { error } = await client.schema("bat_ayin").from("supplier_orders").update(payload).eq("id", id).eq("organization_id", contextResult.ctx.organizationId);
        if (error) throw error;
        const updated = await fetchSupabaseSupplierOrderById(client, id);
        return suppliers.map((item) => item.id === id ? updated : item);
      }
    };
  }

  // src/data/adapters/supabase/supabaseSuppliersAdapter.ts
  function createSupabaseSuppliersAdapter(client) {
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

  // src/domain/organization/orgMemberFilters.ts
  function sortOrgMembers(members) {
    return [...members].sort((a, b) => a.displayName.localeCompare(b.displayName, "he"));
  }
  function findOrgMember(members, userId) {
    return members.find((member) => member.userId === userId);
  }

  // src/data/adapters/supabase/loadSupabaseOrgMembersWriteContext.ts
  async function loadSupabaseOrgMembersWriteContext(client) {
    try {
      if (!client) {
        return { ok: false, reason: "Supabase is not configured.", code: "supabase_not_configured" };
      }
      const { data: authData, error: authError } = await client.auth.getSession();
      if (authError) {
        return {
          ok: false,
          reason: authError.message || "Auth check failed.",
          code: "auth_check_failed",
          error: authError
        };
      }
      if (!authData.session) {
        return { ok: false, reason: NO_SUPABASE_AUTH_SESSION_REASON, code: "auth_session_missing" };
      }
      const authUserId = authData.session.user.id;
      const { data: memberRow, error: memberError } = await client.schema("bat_ayin").from("organization_members").select("role, is_active").eq("organization_id", DEFAULT_ORGANIZATION_ID).eq("user_id", authUserId).maybeSingle();
      if (memberError) {
        return {
          ok: false,
          reason: memberError.message || String(memberError),
          code: "membership_load_failed",
          error: memberError
        };
      }
      if (!memberRow?.is_active) {
        return {
          ok: false,
          reason: "Signed-in user is not an active member of this organization.",
          code: "not_org_member"
        };
      }
      if (memberRow.role !== "manager") {
        return {
          ok: false,
          reason: "Only managers can administer organization members.",
          code: "not_org_manager"
        };
      }
      return {
        ok: true,
        ctx: {
          organizationId: DEFAULT_ORGANIZATION_ID,
          authUserId,
          authUserRole: "manager"
        }
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ok: false, reason: message, code: "unexpected_error", error };
    }
  }

  // src/data/adapters/supabase/mapDbOrgMemberRowToApp.ts
  function mapDbOrgMemberRowToApp(row) {
    return {
      userId: row.user_id,
      displayName: row.display_name || "",
      email: row.email || "",
      role: row.role === "manager" ? "manager" : "user",
      isActive: Boolean(row.is_active),
      firstLoginAt: row.first_login_at,
      lastActivityAt: row.last_activity_at,
      memberSince: row.member_since
    };
  }
  function mapDbOrgMemberRowsToApp(rows) {
    return (rows || []).map(mapDbOrgMemberRowToApp);
  }

  // src/data/adapters/supabase/supabaseOrgMembersReadAdapter.ts
  function createSupabaseOrgMembersReadAdapter(client) {
    return {
      async loadOrgMembers() {
        if (!client) throw new Error("Supabase is not configured.");
        const contextResult = await loadSupabaseOrgMembersWriteContext(client);
        if (!contextResult.ok) {
          throw new Error(contextResult.reason || contextResult.code || "Org members context failed.");
        }
        const batAyin = client.schema("bat_ayin");
        const { data, error } = await batAyin.rpc("list_organization_members", {
          p_organization_id: contextResult.ctx.organizationId
        });
        if (error) throw error;
        return sortOrgMembers(mapDbOrgMemberRowsToApp(data || []));
      }
    };
  }

  // src/domain/organization/orgMemberPermissions.ts
  function canAccessOrgAdmin(ctx) {
    return ctx.role === "manager";
  }
  function countActiveManagers(members) {
    return members.filter((member) => member.role === "manager" && member.isActive).length;
  }
  function isLastActiveManager(members, targetUserId) {
    const target = members.find((member) => member.userId === targetUserId);
    if (!target || target.role !== "manager" || !target.isActive) return false;
    return countActiveManagers(members) <= 1;
  }
  function lastManagerBlockReason(action) {
    if (action === "demote") {
      return "\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05D4\u05D5\u05E8\u05D9\u05D3 \u05DC\u05EA\u05E4\u05E7\u05D9\u05D3 \u05DE\u05E9\u05EA\u05DE\u05E9 \u05D0\u05EA \u05D4\u05DE\u05E0\u05D4\u05DC \u05D4\u05E4\u05E2\u05D9\u05DC \u05D4\u05D0\u05D7\u05E8\u05D5\u05DF \u05D1\u05D0\u05E8\u05D2\u05D5\u05DF.";
    }
    return "\u05DC\u05D0 \u05E0\u05D9\u05EA\u05DF \u05DC\u05D4\u05E9\u05D1\u05D9\u05EA \u05D0\u05EA \u05D4\u05DE\u05E0\u05D4\u05DC \u05D4\u05E4\u05E2\u05D9\u05DC \u05D4\u05D0\u05D7\u05E8\u05D5\u05DF \u05D1\u05D0\u05E8\u05D2\u05D5\u05DF.";
  }
  function canPromoteMember(ctx, member) {
    if (!canAccessOrgAdmin(ctx) || !member) return false;
    return member.isActive && member.role === "user";
  }
  function canDemoteMember(ctx, members, member) {
    if (!canAccessOrgAdmin(ctx) || !member) return false;
    if (!member.isActive || member.role !== "manager") return false;
    return !isLastActiveManager(members, member.userId);
  }
  function canDeactivateMember(ctx, members, member) {
    if (!canAccessOrgAdmin(ctx) || !member || !member.isActive) return false;
    if (member.role === "manager" && isLastActiveManager(members, member.userId)) return false;
    return true;
  }
  function canReactivateMember(ctx, member) {
    if (!canAccessOrgAdmin(ctx) || !member) return false;
    return !member.isActive;
  }
  function orgMemberRoleLabel(role) {
    return role === "manager" ? "\u05DE\u05E0\u05D4\u05DC" : "\u05DE\u05E9\u05EA\u05DE\u05E9";
  }

  // src/data/adapters/supabase/supabaseOrgMembersWriteAdapter.ts
  function actionError(code, reason) {
    return { ok: false, code, reason };
  }
  function inviteError(code, reason) {
    return { ok: false, code, reason };
  }
  function createSupabaseOrgMembersWriteAdapter(client) {
    const readAdapter = createSupabaseOrgMembersReadAdapter(client);
    async function reloadMembers() {
      return readAdapter.loadOrgMembers();
    }
    return {
      async promoteMember(members, userId, ctx) {
        if (!client) return actionError("supabase_not_configured", "Supabase is not configured.");
        const member = findOrgMember(members, userId);
        if (!canPromoteMember(ctx, member)) {
          return actionError("forbidden", "\u05D0\u05D9\u05DF \u05D4\u05E8\u05E9\u05D0\u05D4 \u05DC\u05E7\u05D3\u05DD \u05D7\u05D1\u05E8 \u05D6\u05D4.");
        }
        const contextResult = await loadSupabaseOrgMembersWriteContext(client);
        if (!contextResult.ok) {
          return actionError(contextResult.code || "context_failed", contextResult.reason || "Context failed.");
        }
        const batAyin = client.schema("bat_ayin");
        const { error } = await batAyin.rpc("update_organization_member_role", {
          p_organization_id: contextResult.ctx.organizationId,
          p_user_id: userId,
          p_new_role: "manager"
        });
        if (error) {
          return actionError("rpc_failed", error.message || String(error));
        }
        return { ok: true, members: await reloadMembers() };
      },
      async demoteMember(members, userId, ctx) {
        if (!client) return actionError("supabase_not_configured", "Supabase is not configured.");
        const member = findOrgMember(members, userId);
        if (!canDemoteMember(ctx, members, member)) {
          if (member && member.role === "manager") {
            return actionError("last_manager", lastManagerBlockReason("demote"));
          }
          return actionError("forbidden", "\u05D0\u05D9\u05DF \u05D4\u05E8\u05E9\u05D0\u05D4 \u05DC\u05D4\u05D5\u05E8\u05D9\u05D3 \u05EA\u05E4\u05E7\u05D9\u05D3 \u05DC\u05D7\u05D1\u05E8 \u05D6\u05D4.");
        }
        const contextResult = await loadSupabaseOrgMembersWriteContext(client);
        if (!contextResult.ok) {
          return actionError(contextResult.code || "context_failed", contextResult.reason || "Context failed.");
        }
        const batAyin = client.schema("bat_ayin");
        const { error } = await batAyin.rpc("update_organization_member_role", {
          p_organization_id: contextResult.ctx.organizationId,
          p_user_id: userId,
          p_new_role: "user"
        });
        if (error) {
          const message = error.message || String(error);
          if (message.includes("last active manager")) {
            return actionError("last_manager", lastManagerBlockReason("demote"));
          }
          return actionError("rpc_failed", message);
        }
        return { ok: true, members: await reloadMembers() };
      },
      async deactivateMember(members, userId, ctx) {
        if (!client) return actionError("supabase_not_configured", "Supabase is not configured.");
        const member = findOrgMember(members, userId);
        if (!canDeactivateMember(ctx, members, member)) {
          if (member?.role === "manager") {
            return actionError("last_manager", lastManagerBlockReason("deactivate"));
          }
          return actionError("forbidden", "\u05D0\u05D9\u05DF \u05D4\u05E8\u05E9\u05D0\u05D4 \u05DC\u05D4\u05E9\u05D1\u05D9\u05EA \u05D7\u05D1\u05E8 \u05D6\u05D4.");
        }
        const contextResult = await loadSupabaseOrgMembersWriteContext(client);
        if (!contextResult.ok) {
          return actionError(contextResult.code || "context_failed", contextResult.reason || "Context failed.");
        }
        const batAyin = client.schema("bat_ayin");
        const { error } = await batAyin.rpc("set_organization_member_active", {
          p_organization_id: contextResult.ctx.organizationId,
          p_user_id: userId,
          p_is_active: false
        });
        if (error) {
          const message = error.message || String(error);
          if (message.includes("last active manager")) {
            return actionError("last_manager", lastManagerBlockReason("deactivate"));
          }
          return actionError("rpc_failed", message);
        }
        return { ok: true, members: await reloadMembers() };
      },
      async reactivateMember(members, userId, ctx) {
        if (!client) return actionError("supabase_not_configured", "Supabase is not configured.");
        const member = findOrgMember(members, userId);
        if (!canReactivateMember(ctx, member)) {
          return actionError("forbidden", "\u05D0\u05D9\u05DF \u05D4\u05E8\u05E9\u05D0\u05D4 \u05DC\u05D4\u05E4\u05E2\u05D9\u05DC \u05D7\u05D1\u05E8 \u05D6\u05D4.");
        }
        const contextResult = await loadSupabaseOrgMembersWriteContext(client);
        if (!contextResult.ok) {
          return actionError(contextResult.code || "context_failed", contextResult.reason || "Context failed.");
        }
        const batAyin = client.schema("bat_ayin");
        const { error } = await batAyin.rpc("set_organization_member_active", {
          p_organization_id: contextResult.ctx.organizationId,
          p_user_id: userId,
          p_is_active: true
        });
        if (error) {
          return actionError("rpc_failed", error.message || String(error));
        }
        return { ok: true, members: await reloadMembers() };
      },
      async prepareInvitation(email, role = "user") {
        if (!client) return inviteError("supabase_not_configured", "Supabase is not configured.");
        const contextResult = await loadSupabaseOrgMembersWriteContext(client);
        if (!contextResult.ok) {
          return inviteError(contextResult.code || "context_failed", contextResult.reason || "Context failed.");
        }
        const batAyin = client.schema("bat_ayin");
        const { data, error } = await batAyin.rpc("prepare_organization_invitation", {
          p_organization_id: contextResult.ctx.organizationId,
          p_email: email.trim(),
          p_role: role
        });
        if (error) {
          return inviteError("rpc_failed", error.message || String(error));
        }
        return { ok: true, invitationId: String(data) };
      }
    };
  }

  // src/data/adapters/supabase/supabaseOrgMembersAdapter.ts
  function createSupabaseOrgMembersAdapter(client) {
    const readAdapter = createSupabaseOrgMembersReadAdapter(client);
    const writeAdapter = createSupabaseOrgMembersWriteAdapter(client);
    return {
      loadOrgMembers() {
        return readAdapter.loadOrgMembers();
      },
      promoteMember(members, userId, ctx) {
        return writeAdapter.promoteMember(members, userId, ctx);
      },
      demoteMember(members, userId, ctx) {
        return writeAdapter.demoteMember(members, userId, ctx);
      },
      deactivateMember(members, userId, ctx) {
        return writeAdapter.deactivateMember(members, userId, ctx);
      },
      reactivateMember(members, userId, ctx) {
        return writeAdapter.reactivateMember(members, userId, ctx);
      },
      prepareInvitation(email, role) {
        return writeAdapter.prepareInvitation(email, role);
      }
    };
  }

  // src/data/shared/browserStorage.ts
  function safeParseStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      localStorage.removeItem(key);
      return fallback;
    }
  }
  function safeArrayStorage(key) {
    const value = safeParseStorage(key, []);
    return Array.isArray(value) ? value : [];
  }
  function safeObjectStorage(key, fallback) {
    const value = safeParseStorage(key, fallback);
    return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
  }
  function writeStorageJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      const name = error instanceof DOMException ? error.name : "";
      if (name === "QuotaExceededError") {
        throw new Error("STORAGE_QUOTA_EXCEEDED");
      }
      throw error;
    }
  }

  // src/data/adapters/local/starterTasks.ts
  var DATA_VERSION = "mockup-v3";
  var STARTER_TASKS = [
    { id: "t1", title: "\u05D0\u05D9\u05E9\u05D5\u05E8 \u05D4\u05D6\u05DE\u05E0\u05EA \u05D9\u05E8\u05E7\u05D5\u05EA", category: "kitchen", owner: "\u05E2\u05D3\u05D9\u05E0\u05D4", due: "today", dueLabel: "\u05D4\u05D9\u05D5\u05DD \xB7 \u05E9\u05DC\u05D9\u05E9\u05D9", status: "progress", notes: "\u05DC\u05D1\u05D3\u05D5\u05E7 \u05DE\u05D5\u05DC \u05D4\u05E1\u05E4\u05E7 \u05D5\u05DC\u05D0\u05E9\u05E8 \u05DB\u05DE\u05D5\u05D9\u05D5\u05EA", updates: [{ by: "\u05E2\u05D3\u05D9\u05E0\u05D4", text: "\u05DE\u05D7\u05DB\u05D4 \u05DC\u05DE\u05D7\u05D9\u05E8 \u05E1\u05D5\u05E4\u05D9" }] },
    { id: "t2", title: "\u05D1\u05D3\u05D9\u05E7\u05EA \u05E6\u05D9\u05D5\u05D3 \u05DC\u05E9\u05D1\u05EA", category: "maintenance", owner: "\u05D0\u05D1\u05D9", due: "today", dueLabel: "\u05D4\u05D9\u05D5\u05DD \xB7 \u05E9\u05DC\u05D9\u05E9\u05D9", status: "progress", notes: "\u05DC\u05D5\u05D5\u05D3\u05D0 \u05E9\u05D5\u05DC\u05D7\u05E0\u05D5\u05EA \u05D5\u05DB\u05D1\u05DC\u05D9\u05DD \u05D1\u05D0\u05D5\u05DC\u05DD", updates: [{ by: "\u05D0\u05D1\u05D9", text: "\u05D7\u05E1\u05E8 \u05DB\u05D1\u05DC \u05DE\u05D0\u05E8\u05D9\u05DA \u05D0\u05D7\u05D3" }] },
    { id: "t3", title: "\u05D1\u05D3\u05D9\u05E7\u05EA \u05E1\u05E4\u05E7", category: "events", owner: "\u05D7\u05D9\u05D4", due: "date", dueLabel: "\u05E9\u05E0\u05D9 \xB7 14 \u05D9\u05D5\u05E0\u05D9", status: "progress", notes: "\u05DC\u05E7\u05D1\u05DC \u05D0\u05D9\u05E9\u05D5\u05E8 \u05E2\u05DC \u05DE\u05D5\u05E2\u05D3 \u05D4\u05D2\u05E2\u05D4", updates: [] },
    { id: "t4", title: "\u05D4\u05DB\u05E0\u05EA \u05D3\u05E3 \u05DE\u05E7\u05D5\u05E8\u05D5\u05EA", category: "study", owner: "\u05E2\u05D3\u05D9\u05E0\u05D4", due: "tomorrow", dueLabel: "\u05DE\u05D7\u05E8 \xB7 \u05E8\u05D1\u05D9\u05E2\u05D9", status: "progress", notes: "\u05DC\u05D4\u05D3\u05E4\u05D9\u05E1 \u05E2\u05E9\u05E8\u05D9\u05DD \u05E2\u05D5\u05EA\u05E7\u05D9\u05DD", updates: [] },
    { id: "t11", title: "\u05E1\u05D9\u05D3\u05D5\u05E8 \u05E8\u05E9\u05D9\u05DE\u05EA \u05E7\u05E0\u05D9\u05D5\u05EA", category: "office", owner: "\u05E2\u05D3\u05D9\u05E0\u05D4", due: "today", dueLabel: "\u05D4\u05D9\u05D5\u05DD \xB7 \u05E9\u05DC\u05D9\u05E9\u05D9", status: "progress", notes: "\u05DC\u05E2\u05D3\u05DB\u05DF \u05D0\u05D7\u05E8\u05D9 \u05E9\u05D9\u05D7\u05D4 \u05E2\u05DD \u05D4\u05DE\u05D8\u05D1\u05D7", updates: [] },
    { id: "t12", title: "\u05EA\u05D9\u05D0\u05D5\u05DD \u05D4\u05D3\u05E4\u05E1\u05D5\u05EA", category: "study", owner: "\u05E2\u05D3\u05D9\u05E0\u05D4", due: "today", dueLabel: "\u05D4\u05D9\u05D5\u05DD \xB7 \u05E9\u05DC\u05D9\u05E9\u05D9", status: "progress", notes: "\u05DC\u05D1\u05D3\u05D5\u05E7 \u05DE\u05D5\u05DC \u05D4\u05DE\u05D6\u05DB\u05D9\u05E8\u05D5\u05EA \u05DC\u05E4\u05E0\u05D9 13:00", updates: [] },
    { id: "t5", title: "\u05D0\u05D9\u05E9\u05D5\u05E8 \u05EA\u05E9\u05DC\u05D5\u05DD \u05DC\u05E1\u05E4\u05E7", category: "money", owner: "\u05E6\u05D1\u05D9", due: "today", dueLabel: "\u05D4\u05D9\u05D5\u05DD \xB7 \u05E9\u05DC\u05D9\u05E9\u05D9", status: "progress", notes: "\u05DC\u05D5\u05D5\u05D3\u05D0 \u05D7\u05E9\u05D1\u05D5\u05E0\u05D9\u05EA \u05DC\u05E4\u05E0\u05D9 \u05D0\u05D9\u05E9\u05D5\u05E8", updates: [] },
    { id: "t6", title: "\u05E9\u05D9\u05D7\u05D4 \u05E2\u05DD \u05D0\u05D9\u05E9 \u05EA\u05D7\u05D6\u05D5\u05E7\u05D4", category: "maintenance", owner: "\u05E6\u05D1\u05D9", due: "today", dueLabel: "\u05D4\u05D9\u05D5\u05DD \xB7 \u05E9\u05DC\u05D9\u05E9\u05D9", status: "progress", notes: "\u05DC\u05EA\u05D0\u05DD \u05EA\u05D9\u05E7\u05D5\u05DF \u05D9\u05D3\u05D9\u05EA \u05D1\u05D3\u05DC\u05EA", updates: [] },
    { id: "t7", title: "\u05EA\u05E9\u05DC\u05D5\u05DD \u05DC\u05E1\u05E4\u05E7", category: "money", owner: "\u05E2\u05D3\u05D9\u05E0\u05D4", due: "done", dueLabel: "\u05D4\u05D5\u05E9\u05DC\u05DD \xB7 \u05E8\u05D0\u05E9\u05D5\u05DF", status: "done", notes: "\u05E0\u05E1\u05D2\u05E8", updates: [{ by: "\u05E6\u05D1\u05D9", text: "\u05D0\u05D5\u05E9\u05E8 \u05D1\u05DE\u05D6\u05DB\u05D9\u05E8\u05D5\u05EA" }] },
    { id: "t8", title: "\u05D3\u05E3 \u05DE\u05E7\u05D5\u05E8\u05D5\u05EA \u05DC\u05E9\u05D9\u05E2\u05D5\u05E8", category: "study", owner: "\u05E2\u05D3\u05D9\u05E0\u05D4", due: "done", dueLabel: "\u05D4\u05D5\u05E9\u05DC\u05DD \xB7 \u05E9\u05E0\u05D9", status: "done", notes: "\u05D4\u05D5\u05E2\u05D1\u05E8 \u05DC\u05D4\u05D3\u05E4\u05E1\u05D4", updates: [] },
    { id: "t9", title: "\u05D4\u05D6\u05DE\u05E0\u05EA \u05E6\u05D9\u05D5\u05D3", category: "maintenance", owner: "\u05E6\u05D1\u05D9", due: "done", dueLabel: "\u05D4\u05D5\u05E9\u05DC\u05DD \xB7 \u05E9\u05E0\u05D9", status: "done", notes: "\u05D1\u05D5\u05E6\u05E2", updates: [] },
    { id: "t10", title: "\u05D1\u05D3\u05D9\u05E7\u05EA \u05DE\u05DC\u05D0\u05D9", category: "kitchen", owner: "\u05D7\u05D9\u05D4", due: "tomorrow", dueLabel: "\u05DE\u05D7\u05E8 \xB7 \u05E8\u05D1\u05D9\u05E2\u05D9", status: "progress", notes: "\u05DC\u05D1\u05D3\u05D5\u05E7 \u05E9\u05DE\u05DF, \u05E7\u05DE\u05D7 \u05D5\u05EA\u05D1\u05DC\u05D9\u05E0\u05D9\u05DD", updates: [] }
  ];

  // src/data/adapters/local/localTasksAdapter.ts
  function createLocalTasksAdapter() {
    return {
      loadTasks() {
        if (localStorage.getItem("beit-version") !== DATA_VERSION) {
          writeStorageJson("beit-tasks", STARTER_TASKS);
          localStorage.setItem("beit-version", DATA_VERSION);
        }
        const value = safeParseStorage("beit-tasks", null);
        const raw = Array.isArray(value) ? value : STARTER_TASKS;
        return raw.map((task) => normalizeTask(task));
      },
      saveTasks(tasks) {
        writeStorageJson("beit-tasks", tasks);
        return tasks;
      },
      createTask(tasks, task) {
        return this.saveTasks([task, ...tasks]);
      },
      updateTask(tasks, id, patch) {
        return this.saveTasks(tasks.map((task) => task.id === id ? { ...task, ...patch } : task));
      },
      deleteTaskSoft(tasks, id, deletedBy) {
        return this.updateTask(tasks, id, { deleted_at: isoDateFromOffset(0), deleted_by: deletedBy });
      },
      completeTask(tasks, id) {
        const task = tasks.find((item) => item.id === id);
        if (!task) return tasks;
        return this.updateTask(tasks, id, {
          status: "done",
          due: "done",
          due_date: null,
          dueLabel: "\u05D4\u05D5\u05E9\u05DC\u05DD \xB7 \u05D4\u05D9\u05D5\u05DD",
          completed_at: isoDateFromOffset(0),
          reminder: { ...task.reminder, enabled: false }
        });
      },
      reopenTask(tasks, id) {
        const task = tasks.find((item) => item.id === id);
        if (!task) return tasks;
        const dueDate = task.due === "done" ? isoDateFromOffset(0) : task.due_date;
        return this.updateTask(tasks, id, {
          status: "progress",
          due: task.due === "done" ? "today" : task.due,
          due_date: dueDate,
          dueLabel: task.due === "done" ? "\u05D4\u05D9\u05D5\u05DD \xB7 \u05E9\u05DC\u05D9\u05E9\u05D9" : task.dueLabel,
          completed_at: null,
          reminder: defaultTaskReminder({ ...task, due_date: dueDate })
        });
      }
    };
  }

  // src/data/shared/normalizeSupplier.ts
  function normalizeSupplierSteps(steps) {
    return SUPPLIER_STEP_IDS.reduce((acc, stepId) => {
      acc[stepId] = Boolean(steps?.[stepId]);
      return acc;
    }, {});
  }
  function normalizeSupplierStepDates(stepDates) {
    return SUPPLIER_STEP_IDS.reduce((acc, stepId) => {
      acc[stepId] = stepDates?.[stepId] ? stepDates[stepId] : "";
      return acc;
    }, {});
  }
  function normalizeSupplier(item, index = 0) {
    return {
      id: item.id || `s${Date.now()}-${index}`,
      supplier: item.supplier || "\u05E1\u05E4\u05E7 \u05DC\u05DC\u05D0 \u05E9\u05DD",
      description: item.description || "",
      amount: item.amount || "",
      due_date: item.due_date || "",
      notes: item.notes || "",
      document_notes: item.document_notes || "",
      links: Array.isArray(item.links) ? item.links : [],
      assignees: Array.isArray(item.assignees) ? item.assignees : [],
      allAssignees: Boolean(item.allAssignees),
      steps: normalizeSupplierSteps(item.steps),
      step_dates: normalizeSupplierStepDates(item.step_dates),
      created_at: item.created_at || isoDateFromOffset(-index),
      deleted_at: item.deleted_at ?? null,
      deleted_by: item.deleted_by ?? null
    };
  }

  // src/data/adapters/local/starterSuppliers.ts
  var STARTER_SUPPLIERS = [
    {
      id: "s1",
      supplier: "\u05E1\u05E4\u05E7 \u05D9\u05E8\u05E7\u05D5\u05EA",
      description: "\u05D4\u05D6\u05DE\u05E0\u05EA \u05D9\u05E8\u05E7\u05D5\u05EA \u05DC\u05E9\u05D1\u05EA",
      amount: "\u20AA680",
      due_date: isoDateFromOffset(1),
      notes: "\u05DC\u05D5\u05D5\u05D3\u05D0 \u05DB\u05DE\u05D5\u05D9\u05D5\u05EA \u05DE\u05D5\u05DC \u05D4\u05DE\u05D8\u05D1\u05D7 \u05DC\u05E4\u05E0\u05D9 \u05EA\u05E9\u05DC\u05D5\u05DD.",
      document_notes: "\u05D7\u05E9\u05D1\u05D5\u05E0\u05D9\u05EA \u05EA\u05EA\u05D5\u05D5\u05E1\u05E3 \u05D0\u05D7\u05E8\u05D9 \u05E7\u05D1\u05DC\u05EA \u05D4\u05E1\u05D7\u05D5\u05E8\u05D4.",
      links: ["https://example.com/order-vegetables"],
      assignees: ["\u05E2\u05D3\u05D9\u05E0\u05D4"],
      allAssignees: false,
      steps: { order: true, received: false, payment: false, invoice: false },
      step_dates: { order: isoDateFromOffset(0), received: "", payment: "", invoice: "" },
      created_at: isoDateFromOffset(0)
    },
    {
      id: "s2",
      supplier: "\u05E6\u05D9\u05D5\u05D3 \u05EA\u05D7\u05D6\u05D5\u05E7\u05D4",
      description: "\u05E8\u05DB\u05D9\u05E9\u05EA \u05DB\u05D1\u05DC\u05D9\u05DD \u05D5\u05E6\u05D9\u05D5\u05D3 \u05DC\u05D0\u05D5\u05DC\u05DD",
      amount: "",
      due_date: "",
      notes: "\u05DE\u05D9\u05D5\u05E2\u05D3 \u05DC\u05DB\u05DC \u05E6\u05D5\u05D5\u05EA \u05D4\u05E0\u05D9\u05D4\u05D5\u05DC.",
      document_notes: "\u05E6\u05D9\u05DC\u05D5\u05DD \u05DE\u05E1\u05DA \u05D4\u05E6\u05E2\u05EA \u05DE\u05D7\u05D9\u05E8 \u05E0\u05E9\u05DE\u05E8 \u05D1\u05D9\u05E0\u05EA\u05D9\u05D9\u05DD \u05D1\u05D4\u05E2\u05E8\u05D5\u05EA.",
      links: [],
      assignees: [],
      allAssignees: true,
      steps: { order: true, received: true, payment: false, invoice: false },
      step_dates: { order: isoDateFromOffset(-1), received: isoDateFromOffset(0), payment: "", invoice: "" },
      created_at: isoDateFromOffset(-1)
    }
  ];

  // src/data/adapters/local/localSuppliersAdapter.ts
  function createLocalSuppliersAdapter() {
    return {
      loadSuppliers() {
        if (!localStorage.getItem("beit-suppliers")) {
          writeStorageJson("beit-suppliers", STARTER_SUPPLIERS);
        }
        const value = safeParseStorage("beit-suppliers", null);
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
          {}
        );
        return this.updateSupplierOrder(suppliers, id, (item) => ({
          ...item,
          steps: allSteps,
          step_dates: SUPPLIER_STEP_IDS.reduce(
            (acc, step) => ({ ...acc, [step]: item.step_dates[step] || today }),
            {}
          )
        }));
      }
    };
  }

  // src/data/catalog/basePeople.ts
  var BASE_PEOPLE = ["\u05E2\u05D3\u05D9\u05E0\u05D4", "\u05D0\u05D1\u05D9", "\u05D7\u05D9\u05D4", "\u05E6\u05D1\u05D9"];
  var HIDDEN_PEOPLE_KEY = "beit-hidden-people";
  var CUSTOM_PEOPLE_KEY = "beit-people";

  // src/data/adapters/local/localOrgMembersAdapter.ts
  function starterMembers() {
    const roles = {
      \u05E6\u05D1\u05D9: "manager",
      \u05E2\u05D3\u05D9\u05E0\u05D4: "user",
      \u05D0\u05D1\u05D9: "user",
      \u05D7\u05D9\u05D4: "user"
    };
    return BASE_PEOPLE.map((name, index) => ({
      userId: `local-member-${index + 1}`,
      displayName: name,
      email: `${name}@example.com`,
      role: roles[name] || "user",
      isActive: true,
      firstLoginAt: "2024-01-01T00:00:00.000Z",
      lastActivityAt: "2024-06-01T00:00:00.000Z",
      memberSince: "2024-01-01T00:00:00.000Z"
    }));
  }
  function actionError2(code, reason) {
    return { ok: false, code, reason };
  }
  function createLocalOrgMembersAdapter() {
    return {
      loadOrgMembers() {
        return sortOrgMembers(starterMembers());
      },
      promoteMember(members, userId, ctx) {
        const member = findOrgMember(members, userId);
        if (!canPromoteMember(ctx, member)) {
          return actionError2("forbidden", "\u05D0\u05D9\u05DF \u05D4\u05E8\u05E9\u05D0\u05D4 \u05DC\u05E7\u05D3\u05DD.");
        }
        return {
          ok: true,
          members: members.map(
            (row) => row.userId === userId ? { ...row, role: "manager" } : row
          )
        };
      },
      demoteMember(members, userId, ctx) {
        const member = findOrgMember(members, userId);
        if (!canDemoteMember(ctx, members, member)) {
          if (member?.role === "manager") {
            return actionError2("last_manager", lastManagerBlockReason("demote"));
          }
          return actionError2("forbidden", "\u05D0\u05D9\u05DF \u05D4\u05E8\u05E9\u05D0\u05D4 \u05DC\u05D4\u05D5\u05E8\u05D9\u05D3 \u05EA\u05E4\u05E7\u05D9\u05D3.");
        }
        return {
          ok: true,
          members: members.map(
            (row) => row.userId === userId ? { ...row, role: "user" } : row
          )
        };
      },
      deactivateMember(members, userId, ctx) {
        const member = findOrgMember(members, userId);
        if (!canDeactivateMember(ctx, members, member)) {
          if (member?.role === "manager") {
            return actionError2("last_manager", lastManagerBlockReason("deactivate"));
          }
          return actionError2("forbidden", "\u05D0\u05D9\u05DF \u05D4\u05E8\u05E9\u05D0\u05D4 \u05DC\u05D4\u05E9\u05D1\u05D9\u05EA.");
        }
        return {
          ok: true,
          members: members.map(
            (row) => row.userId === userId ? { ...row, isActive: false } : row
          )
        };
      },
      reactivateMember(members, userId, ctx) {
        const member = findOrgMember(members, userId);
        if (!canReactivateMember(ctx, member)) {
          return actionError2("forbidden", "\u05D0\u05D9\u05DF \u05D4\u05E8\u05E9\u05D0\u05D4 \u05DC\u05D4\u05E4\u05E2\u05D9\u05DC.");
        }
        return {
          ok: true,
          members: members.map(
            (row) => row.userId === userId ? { ...row, isActive: true } : row
          )
        };
      },
      prepareInvitation(email) {
        return { ok: true, invitationId: `local-invite-${email.trim().toLowerCase()}` };
      }
    };
  }

  // src/data/shared/createAsyncRepository.ts
  function createAsyncRepository(adapter, methods) {
    const repository = {};
    for (const method of methods) {
      const fn = adapter[method];
      if (typeof fn !== "function") continue;
      repository[method] = (...args) => Promise.resolve(fn.apply(adapter, args));
    }
    return repository;
  }

  // src/data/catalog/baseCategories.ts
  var BASE_CATEGORIES = [
    { id: "kitchen", label: "\u05DE\u05D8\u05D1\u05D7", icon: "kitchen" },
    { id: "maintenance", label: "\u05EA\u05D7\u05D6\u05D5\u05E7\u05D4", icon: "maintenance" },
    { id: "study", label: "\u05DC\u05D9\u05DE\u05D5\u05D3", icon: "study" },
    { id: "money", label: "\u05DB\u05E1\u05E4\u05D9\u05DD", icon: "money" },
    { id: "events", label: "\u05D0\u05D9\u05E8\u05D5\u05E2\u05D9\u05DD", icon: "events" },
    { id: "office", label: "\u05DE\u05E9\u05E8\u05D3", icon: "office" }
  ];
  var HIDDEN_CATEGORIES_KEY = "beit-hidden-categories";
  var CUSTOM_CATEGORIES_KEY = "beit-categories";

  // src/data/catalog/categoriesService.ts
  function loadCategories() {
    const hidden = safeArrayStorage(HIDDEN_CATEGORIES_KEY);
    const custom = safeArrayStorage(CUSTOM_CATEGORIES_KEY);
    return [...BASE_CATEGORIES.filter((c) => !hidden.includes(c.id)), ...custom];
  }
  function readHiddenCategoryIds() {
    return safeArrayStorage(HIDDEN_CATEGORIES_KEY);
  }
  function readCustomCategories() {
    return safeArrayStorage(CUSTOM_CATEGORIES_KEY);
  }
  function saveHiddenCategoryIds(ids) {
    writeStorageJson(HIDDEN_CATEGORIES_KEY, ids);
  }
  function saveCustomCategories(categories) {
    writeStorageJson(CUSTOM_CATEGORIES_KEY, categories);
  }

  // src/data/catalog/peopleService.ts
  function loadPeople() {
    const hidden = safeArrayStorage(HIDDEN_PEOPLE_KEY);
    const custom = safeArrayStorage(CUSTOM_PEOPLE_KEY);
    return [...BASE_PEOPLE.filter((p) => !hidden.includes(p)), ...custom];
  }
  function readHiddenPeople() {
    return safeArrayStorage(HIDDEN_PEOPLE_KEY);
  }
  function readCustomPeople() {
    return safeArrayStorage(CUSTOM_PEOPLE_KEY);
  }
  function saveHiddenPeople(names) {
    writeStorageJson(HIDDEN_PEOPLE_KEY, names);
  }
  function saveCustomPeople(names) {
    writeStorageJson(CUSTOM_PEOPLE_KEY, names);
  }
  function allKnownPeople() {
    return [...BASE_PEOPLE, ...readCustomPeople()];
  }

  // src/data/catalog/supplierStepsMeta.ts
  var SUPPLIER_STEPS = [
    { id: "order", label: "\u05D4\u05D6\u05DE\u05E0\u05D4" },
    { id: "received", label: "\u05E7\u05D1\u05DC\u05D4" },
    { id: "payment", label: "\u05EA\u05E9\u05DC\u05D5\u05DD" },
    { id: "invoice", label: "\u05D7\u05E9\u05D1\u05D5\u05E0\u05D9\u05EA" }
  ];

  // src/data/catalog/preferencesService.ts
  var PREFS_STORAGE_KEY = "beit-prefs";
  var DEFAULT_PREFS = {
    dark: false,
    text: "\u05E8\u05D2\u05D9\u05DC"
  };
  function loadPreferences() {
    return safeObjectStorage(PREFS_STORAGE_KEY, DEFAULT_PREFS);
  }
  function savePreferences(prefs) {
    writeStorageJson(PREFS_STORAGE_KEY, prefs);
  }

  // src/domain/shared/appRoles.ts
  var DEMO_USER_OWNER = "\u05E2\u05D3\u05D9\u05E0\u05D4";
  var DEMO_MANAGER_OWNER = "\u05E6\u05D1\u05D9";
  function personalOwner(ctx) {
    return ctx.userOwner;
  }

  // src/domain/shared/ageLabels.ts
  function ageLabel(createdAt) {
    const days = daysBetween(createdAt);
    return days === 1 ? "\u05E0\u05D5\u05E6\u05E8\u05D4 \u05DC\u05E4\u05E0\u05D9 \u05D9\u05D5\u05DD" : `\u05E0\u05D5\u05E6\u05E8\u05D4 \u05DC\u05E4\u05E0\u05D9 ${days} \u05D9\u05DE\u05D9\u05DD`;
  }
  function relativeAgeLabel(createdAt) {
    const days = daysBetween(createdAt);
    if (days === 0) return "\u05D4\u05D9\u05D5\u05DD";
    return days === 1 ? "\u05DC\u05E4\u05E0\u05D9 \u05D9\u05D5\u05DD" : `\u05DC\u05E4\u05E0\u05D9 ${days} \u05D9\u05DE\u05D9\u05DD`;
  }

  // src/domain/shared/formatHebrewDate.ts
  function formatHebrewDate(value) {
    if (!value) return "\u05DC\u05DC\u05D0 \u05D9\u05E2\u05D3";
    const date = dateFromIso(value);
    if (!date) return "\u05DC\u05DC\u05D0 \u05D9\u05E2\u05D3";
    const days = ["\u05E8\u05D0\u05E9\u05D5\u05DF", "\u05E9\u05E0\u05D9", "\u05E9\u05DC\u05D9\u05E9\u05D9", "\u05E8\u05D1\u05D9\u05E2\u05D9", "\u05D7\u05DE\u05D9\u05E9\u05D9", "\u05E9\u05D9\u05E9\u05D9", "\u05E9\u05D1\u05EA"];
    const months = ["\u05D9\u05E0\u05D5\u05D0\u05E8", "\u05E4\u05D1\u05E8\u05D5\u05D0\u05E8", "\u05DE\u05E8\u05E5", "\u05D0\u05E4\u05E8\u05D9\u05DC", "\u05DE\u05D0\u05D9", "\u05D9\u05D5\u05E0\u05D9", "\u05D9\u05D5\u05DC\u05D9", "\u05D0\u05D5\u05D2\u05D5\u05E1\u05D8", "\u05E1\u05E4\u05D8\u05DE\u05D1\u05E8", "\u05D0\u05D5\u05E7\u05D8\u05D5\u05D1\u05E8", "\u05E0\u05D5\u05D1\u05DE\u05D1\u05E8", "\u05D3\u05E6\u05DE\u05D1\u05E8"];
    return `${days[date.getDay()]} \xB7 ${date.getDate()} ${months[date.getMonth()]}`;
  }

  // src/domain/shared/priorityLabel.ts
  function priorityLabel(priority) {
    return priority === "high" ? "\u05D2\u05D1\u05D5\u05D4\u05D4" : "\u05E8\u05D2\u05D9\u05DC\u05D4";
  }

  // src/domain/shared/resolveCategory.ts
  var FALLBACK_CATEGORY = {
    id: "uncategorized",
    label: "\u05DC\u05DC\u05D0 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4",
    icon: "office"
  };
  function resolveCategory(categories, id) {
    return categories.find((c) => c.id === id) ?? FALLBACK_CATEGORY;
  }

  // src/domain/tasks/taskActive.ts
  function filterActiveTasks(tasks) {
    return tasks.filter((t) => !t.deleted_at);
  }

  // src/domain/tasks/taskDue.ts
  function isTaskOverdue(task) {
    if (task.status === "done" || !task.due_date) return false;
    const dueOnly = toIsoDateOnly(task.due_date);
    return dueOnly ? dueOnly < isoDateFromOffset(0) : false;
  }
  function buildTaskDueLabel(task) {
    if (task.status === "done") return task.dueLabel || "\u05D4\u05D5\u05E9\u05DC\u05DD";
    if (!task.due_date) return "\u05DC\u05DC\u05D0 \u05D9\u05E2\u05D3";
    if (isTaskOverdue(task)) return `\u05E2\u05D1\u05E8 \u05D9\u05E2\u05D3 \u2022 ${formatHebrewDate(task.due_date)}`;
    const diff = daysFromTodayIso(task.due_date);
    if (diff === 0) return `\u05D4\u05D9\u05D5\u05DD \xB7 ${formatHebrewDate(task.due_date).split(" \xB7 ")[0]}`;
    if (diff === 1) return `\u05DE\u05D7\u05E8 \xB7 ${formatHebrewDate(task.due_date).split(" \xB7 ")[0]}`;
    return formatHebrewDate(task.due_date);
  }
  function taskDueRank(task) {
    if (task.status === "done") return 5;
    if (isTaskOverdue(task)) return 0;
    if (!task.due_date) return 4;
    const diff = daysFromTodayIso(task.due_date);
    if (diff === 0) return 1;
    if (diff === 1) return 2;
    return 3;
  }

  // src/domain/tasks/taskFilters.ts
  function isPersonalTask(task, ctx) {
    if (ctx.userId && task.assigneeId) {
      return task.assigneeId === ctx.userId;
    }
    return task.owner === personalOwner(ctx);
  }
  function filterPersonalTasks(tasks, ctx) {
    return tasks.filter((t) => isPersonalTask(t, ctx));
  }
  function filterManagementPeople(people, ctx) {
    return people.filter((person) => person !== personalOwner(ctx));
  }
  function buildManagementTaskAssignees(people, ctx) {
    const owner = personalOwner(ctx);
    const rows = [];
    if (owner) {
      rows.push({ label: "\u05D0\u05E0\u05D9", person: owner });
    }
    for (const person of filterManagementPeople(people, ctx)) {
      rows.push({ label: person, person });
    }
    return rows;
  }
  var DONE_ARCHIVE_DAYS = 30;
  function isArchivedDone(task) {
    return task.status === "done" && daysBetween(task.completed_at || task.created_at) >= DONE_ARCHIVE_DAYS;
  }
  function filterVisibleDoneTasks(tasks, includeArchive = false) {
    return filterActiveTasks(tasks).filter(
      (t) => t.status === "done" && (includeArchive || !isArchivedDone(t))
    );
  }
  function filterOpenTasks(tasks) {
    return filterActiveTasks(tasks).filter((t) => t.status !== "done");
  }

  // src/domain/tasks/taskPermissions.ts
  function canAccessTask(ctx, task) {
    if (!task || task.deleted_at) return false;
    if (ctx.role === "manager") return true;
    return isPersonalTask(task, ctx);
  }
  function canEditTaskContent(ctx, task) {
    if (!task || !canAccessTask(ctx, task)) return false;
    return task.status !== "done" && !task.deleted_at;
  }
  function canDeleteTask(ctx, task) {
    if (!task) return false;
    return ctx.role === "manager" && !task.deleted_at;
  }

  // src/domain/tasks/taskLookup.ts
  function findTask(tasks, id) {
    return tasks.find((x) => x.id === id);
  }
  function findVisibleTask(tasks, id, ctx) {
    const task = findTask(tasks, id);
    return canAccessTask(ctx, task) ? task ?? null : null;
  }

  // src/domain/tasks/taskSort.ts
  function sortOptions(context = "personal") {
    if (context === "org") return [["date", "\u05DC\u05E4\u05D9 \u05EA\u05D0\u05E8\u05D9\u05DA"], ["category", "\u05DC\u05E4\u05D9 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4"], ["owner", "\u05DC\u05E4\u05D9 \u05DE\u05D1\u05E6\u05E2"]];
    if (context === "category") return [["date", "\u05DC\u05E4\u05D9 \u05EA\u05D0\u05E8\u05D9\u05DA"], ["owner", "\u05DC\u05E4\u05D9 \u05DE\u05D1\u05E6\u05E2"]];
    if (context === "person") return [["date", "\u05DC\u05E4\u05D9 \u05EA\u05D0\u05E8\u05D9\u05DA"], ["category", "\u05DC\u05E4\u05D9 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4"]];
    return [["date", "\u05DC\u05E4\u05D9 \u05EA\u05D0\u05E8\u05D9\u05DA"], ["category", "\u05DC\u05E4\u05D9 \u05E7\u05D8\u05D2\u05D5\u05E8\u05D9\u05D4"]];
  }
  function resolveCurrentSort(allSort, context = "personal") {
    const allowed = sortOptions(context).map(([key]) => key);
    return allowed.includes(allSort) ? allSort : "date";
  }
  function taskGroupTitle(task, sortMode, categories) {
    if (sortMode === "category") return resolveCategory(categories, task.category).label;
    if (sortMode === "owner") return task.owner ?? "";
    return "";
  }
  function sortTasks(tasks, sortMode, categories) {
    const priorityDiff = (a, b) => (a.priority === "high" ? 0 : 1) - (b.priority === "high" ? 0 : 1);
    const dueDiff = (a, b) => taskDueRank(a) - taskDueRank(b) || buildTaskDueLabel(a).localeCompare(buildTaskDueLabel(b), "he") || (a.title ?? "").localeCompare(b.title ?? "", "he");
    return [...tasks].sort((a, b) => {
      if (sortMode === "owner") {
        return (a.owner ?? "").localeCompare(b.owner ?? "", "he") || priorityDiff(a, b) || dueDiff(a, b);
      }
      const byPriority = priorityDiff(a, b);
      if (byPriority) return byPriority;
      if (sortMode === "category") {
        return resolveCategory(categories, a.category).label.localeCompare(
          resolveCategory(categories, b.category).label,
          "he"
        ) || dueDiff(a, b);
      }
      return dueDiff(a, b);
    });
  }

  // src/domain/tasks/managementTaskGroups.ts
  function taskCreatedAtMs(task) {
    const raw = task.created_at;
    if (!raw) return 0;
    const ms = Date.parse(raw);
    return Number.isFinite(ms) ? ms : 0;
  }
  function sortTasksChronologicalNewestFirst(tasks) {
    return [...tasks].sort(
      (a, b) => taskCreatedAtMs(b) - taskCreatedAtMs(a) || String(b.id ?? "").localeCompare(String(a.id ?? "")) || (a.title ?? "").localeCompare(b.title ?? "", "he")
    );
  }
  function buildManagementPriorityChronologicalGroups(tasks) {
    const groups = [];
    const highTasks = sortTasksChronologicalNewestFirst(
      tasks.filter((task) => task.priority === "high")
    );
    const normalTasks = sortTasksChronologicalNewestFirst(
      tasks.filter((task) => task.priority !== "high")
    );
    if (highTasks.length) {
      groups.push({ priority: "high", title: "\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA \u05D2\u05D1\u05D5\u05D4\u05D4", tasks: highTasks });
    }
    if (normalTasks.length) {
      groups.push({ priority: "normal", title: "\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA \u05E0\u05DE\u05D5\u05DB\u05D4", tasks: normalTasks });
    }
    return groups;
  }
  function sortTasksByDueDate(tasks) {
    return [...tasks].sort(
      (a, b) => taskDueRank(a) - taskDueRank(b) || buildTaskDueLabel(a).localeCompare(buildTaskDueLabel(b), "he") || (a.title ?? "").localeCompare(b.title ?? "", "he")
    );
  }
  function buildManagementAssigneePriorityGroups(tasks, assigneeOrder = []) {
    const byAssignee = /* @__PURE__ */ new Map();
    for (const task of tasks) {
      const assignee = task.owner?.trim() || "\u05DC\u05DC\u05D0 \u05E9\u05D9\u05D5\u05DA";
      const bucket = byAssignee.get(assignee);
      if (bucket) bucket.push(task);
      else byAssignee.set(assignee, [task]);
    }
    const orderedAssignees = [
      ...assigneeOrder.filter((name) => byAssignee.has(name)),
      ...[...byAssignee.keys()].filter((name) => !assigneeOrder.includes(name)).sort((a, b) => a.localeCompare(b, "he"))
    ];
    return orderedAssignees.map((assignee) => {
      const assigneeTasks = byAssignee.get(assignee) || [];
      const highTasks = sortTasksByDueDate(assigneeTasks.filter((task) => task.priority === "high"));
      const normalTasks = sortTasksByDueDate(
        assigneeTasks.filter((task) => task.priority !== "high")
      );
      const priorityGroups = [];
      if (highTasks.length) {
        priorityGroups.push({
          priority: "high",
          title: `\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA ${priorityLabel("high")}`,
          tasks: highTasks
        });
      }
      if (normalTasks.length) {
        priorityGroups.push({
          priority: "normal",
          title: `\u05E2\u05D3\u05D9\u05E4\u05D5\u05EA ${priorityLabel("normal")}`,
          tasks: normalTasks
        });
      }
      return { assignee, title: assignee, priorityGroups };
    }).filter((group) => group.priorityGroups.length > 0);
  }

  // src/domain/suppliers/supplierPermissions.ts
  function canAccessSupplier(ctx, item) {
    if (!item || item.deleted_at) return false;
    return ctx.role === "manager" || item.allAssignees || item.assignees.includes(personalOwner(ctx));
  }

  // src/domain/suppliers/supplierProgress.ts
  function supplierProgress(item, steps) {
    const done = steps.filter((step) => item.steps[step.id]).length;
    return { done, total: steps.length, complete: done === steps.length };
  }

  // src/domain/suppliers/supplierFilters.ts
  function compareSuppliersForList(a, b, steps) {
    const aDone = supplierProgress(a, steps).complete ? 1 : 0;
    const bDone = supplierProgress(b, steps).complete ? 1 : 0;
    return aDone - bDone || (a.due_date || "9999").localeCompare(b.due_date || "9999") || a.supplier.localeCompare(b.supplier, "he");
  }
  function filterVisibleSuppliers(suppliers, ctx, steps) {
    return suppliers.filter((item) => canAccessSupplier(ctx, item)).sort((a, b) => compareSuppliersForList(a, b, steps));
  }

  // src/domain/suppliers/supplierLookup.ts
  function findSupplier(suppliers, id) {
    return suppliers.find((item) => item.id === id);
  }
  function findVisibleSupplier(suppliers, id, ctx) {
    const item = findSupplier(suppliers, id);
    return canAccessSupplier(ctx, item) ? item ?? null : null;
  }

  // src/pilot/pilotConfig.ts
  var PILOT_SUPABASE_URL = "https://jxjxjvxbxpgvlarzbohm.supabase.co";
  var PILOT_APP_URL = "https://bat-ayin-tasks.vercel.app";
  function getPilotOAuthRedirectUrl() {
    return `${PILOT_APP_URL}/index.html`;
  }
  var PILOT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp4anhqdnhieHBndmxhcnpib2htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NTgyNjUsImV4cCI6MjA5NTUzNDI2NX0.g1W8SJWTRc3FYeZJIVdLBTKcSfHVgfQQZ_brjRKest4";
  var PILOT_MIGRATION_STORAGE_KEY = "beit-pilot-migrated";
  function resolvePilotDataBackend(searchParams) {
    if (searchParams.get("debugBackend") === "local") return "local";
    return "supabase";
  }
  function isPilotDebugEnabled(searchParams) {
    const backend = searchParams.get("debugBackend");
    return searchParams.get("debug") === "1" || backend === "local" || backend === "supabase";
  }
  function isSupabasePlaceholder(value) {
    if (!value || typeof value !== "string") return true;
    return value.includes("your-project") || value.includes("your-supabase-anon-key");
  }

  // src/pilot/ensurePilotProfile.ts
  async function ensurePilotProfile(client, user) {
    const existing = await client.from("profiles").select("id, display_name, email").eq("id", user.id).maybeSingle();
    if (existing.error) {
      return { ok: false, code: "profile_load_failed", reason: existing.error.message };
    }
    if (existing.data) {
      return { ok: true, profile: existing.data };
    }
    const email = user.email?.trim() || "";
    if (!email) {
      return { ok: false, code: "email_missing", reason: "Google account has no email." };
    }
    const meta = user.user_metadata || {};
    const displayName = String(meta.full_name || meta.name || email.split("@")[0] || "\u05DE\u05E9\u05EA\u05DE\u05E9").trim() || "\u05DE\u05E9\u05EA\u05DE\u05E9";
    const inserted = await client.from("profiles").insert({ id: user.id, email, display_name: displayName }).select("id, display_name, email").single();
    if (inserted.error) {
      return { ok: false, code: "profile_create_failed", reason: inserted.error.message };
    }
    return { ok: true, profile: inserted.data };
  }

  // src/pilot/loadPilotAuthContext.ts
  async function loadPilotAuthContext(client) {
    const empty = {
      status: "signed_out",
      role: "user",
      userId: "",
      email: "",
      displayName: "",
      orgPeople: [],
      orgCategories: []
    };
    if (!client) {
      return { ...empty, status: "error", code: "supabase_not_configured", reason: "Supabase is not configured." };
    }
    try {
      const { data: authData, error: authError } = await client.auth.getSession();
      if (authError) {
        return { ...empty, status: "error", code: "auth_check_failed", reason: authError.message };
      }
      if (!authData.session?.user) {
        return empty;
      }
      const user = authData.session.user;
      const profileResult = await ensurePilotProfile(client, user);
      if (!profileResult.ok) {
        const status = profileResult.code === "profile_create_failed" ? "missing_profile" : "error";
        return {
          ...empty,
          status,
          userId: user.id,
          email: user.email || "",
          code: profileResult.code,
          reason: profileResult.reason
        };
      }
      const ctxResult = await loadSupabaseTasksWriteContext(client);
      if (!ctxResult.ok) {
        const status = ctxResult.code === "not_org_member" ? "not_org_member" : "error";
        return {
          ...empty,
          status,
          userId: user.id,
          email: user.email || "",
          displayName: profileResult.profile.display_name,
          code: ctxResult.code,
          reason: ctxResult.reason
        };
      }
      const orgPeople = [...ctxResult.ctx.profileIdByName.keys()].sort((a, b) => a.localeCompare(b, "he"));
      const orgCategories = ctxResult.ctx.categoryCatalog.map((row) => ({
        id: row.id,
        label: row.label,
        icon: row.icon
      }));
      const displayName = ctxResult.ctx.profileNameById.get(user.id) || profileResult.profile.display_name || "";
      return {
        status: "ready",
        role: ctxResult.ctx.authUserRole,
        userId: user.id,
        email: user.email || profileResult.profile.email,
        displayName,
        orgPeople,
        orgCategories
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return { ...empty, status: "error", code: "unexpected_error", reason: message };
    }
  }

  // src/pilot/migrateLocalPilotData.ts
  function readLocalTasks() {
    const tasks = safeParseStorage("beit-tasks", []);
    return Array.isArray(tasks) ? tasks.filter((t) => t && !t.deleted_at) : [];
  }
  function readLocalSuppliers() {
    const suppliers = safeParseStorage("beit-suppliers", []);
    return Array.isArray(suppliers) ? suppliers.filter((s) => s && !s.deleted_at) : [];
  }
  function migrationDone() {
    try {
      return localStorage.getItem(PILOT_MIGRATION_STORAGE_KEY) === "done";
    } catch {
      return false;
    }
  }
  function markMigrationDone() {
    try {
      localStorage.setItem(PILOT_MIGRATION_STORAGE_KEY, "done");
    } catch {
    }
  }
  async function migrateLocalPilotData(options) {
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
          remoteTasks = await options.tasksRepository.createTask(remoteTasks, taskBody);
          migratedTasks += 1;
        }
      }
      let remoteSuppliers = await options.suppliersRepository.loadSuppliers();
      if (!remoteSuppliers.length && localSuppliers.length) {
        for (const supplier of localSuppliers) {
          const { id: _dropId, ...supplierBody } = supplier;
          remoteSuppliers = await options.suppliersRepository.createSupplierOrder(
            remoteSuppliers,
            supplierBody
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
  return __toCommonJS(adaptersBundle_exports);
})();
