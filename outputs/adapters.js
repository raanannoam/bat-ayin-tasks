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
    createSupabaseSuppliersAdapter: () => createSupabaseSuppliersAdapter,
    createSupabaseTasksAdapter: () => createSupabaseTasksAdapter,
    createSupabaseTasksReadAdapter: () => createSupabaseTasksReadAdapter,
    createSupabaseTasksWriteAdapter: () => createSupabaseTasksWriteAdapter,
    defaultTaskReminder: () => defaultTaskReminder,
    getDateBucketFromIso: () => getDateBucketFromIso,
    isoDateFromOffset: () => isoDateFromOffset,
    loadSupabaseTasksWriteContext: () => loadSupabaseTasksWriteContext,
    mapAppTaskToSupabaseInsert: () => mapAppTaskToSupabaseInsert,
    normalizeTask: () => normalizeTask,
    toIsoDateOnly: () => toIsoDateOnly
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
        batAyin.from("categories").select("id, slug").eq("organization_id", DEFAULT_ORGANIZATION_ID).eq("is_active", true).is("deleted_at", null),
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
      return {
        ok: true,
        ctx: {
          organizationId: DEFAULT_ORGANIZATION_ID,
          authUserId,
          authUserRole: currentMember.role === "manager" ? "manager" : "user",
          categoryIdBySlug: buildCategoryIdBySlug(categoriesResult.data),
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
      if (!categoryId) {
        return { ok: false, code: "category_not_found" };
      }
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

  // src/data/adapters/supabase/supabaseSuppliersAdapter.ts
  var NOT_IMPLEMENTED = "Not implemented yet";
  function throwNotImplemented() {
    throw new Error(NOT_IMPLEMENTED);
  }
  function createSupabaseSuppliersAdapter() {
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
  return __toCommonJS(adaptersBundle_exports);
})();
