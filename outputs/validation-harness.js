/**
 * Browser-side integration validation harness.
 * נטען אחרי index.html — משתמש ב-window.__validationHooks
 */
(function validationHarness() {
  "use strict";

  function assert(condition, message) {
    if (!condition) throw new Error(message || "assertion failed");
  }

  function createSuite(name) {
    const steps = [];
    return {
      name,
      async step(id, label, fn) {
        try {
          const detail = await fn();
          steps.push({ id, label, ok: true, detail: detail ?? null });
        } catch (error) {
          steps.push({ id, label, ok: false, error: error?.message || String(error) });
        }
      },
      skip(id, label, reason) {
        steps.push({ id, label, ok: true, skipped: true, reason });
      },
      finish() {
        const failed = steps.filter(s => !s.ok);
        return {
          suite: name,
          ok: failed.length === 0,
          steps,
          failed: failed.map(s => s.id)
        };
      }
    };
  }

  function sampleTask(title) {
    return {
      id: `val-task-${Date.now()}`,
      title: title || "validation task",
      owner: "עדינה",
      category: "office",
      priority: "normal",
      status: "progress",
      notes: "",
      due_date: null,
      dueLabel: null,
      due: "none",
      reminder: { enabled: false },
      updates: [],
      created_at: new Date().toISOString().slice(0, 10)
    };
  }

  function sampleSupplier(marker) {
    const H = window.__validationHooks;
    return {
      id: `val-sup-${Date.now()}`,
      supplier: marker || "validation supplier",
      description: "validation",
      amount: "₪1",
      due_date: H.isoDateFromOffset(1),
      notes: "",
      document_notes: "",
      links: ["https://example.com/validation"],
      assignees: ["עדינה"],
      allAssignees: false,
      steps: { order: false, received: false, payment: false, invoice: false },
      step_dates: { order: "", received: "", payment: "", invoice: "" },
      created_at: H.isoDateFromOffset(0)
    };
  }

  async function runLocalTasksAdapterSuite() {
    const H = window.__validationHooks;
    const suite = createSuite("local-tasks-adapter");
    const adapter = H.localTasksAdapter;
    let tasks = [];

    await suite.step("create", "createTask adds task", async () => {
      const task = sampleTask("local adapter create");
      tasks = adapter.createTask(tasks, task);
      assert(tasks.some(t => t.id === task.id), "task not in list");
    });

    await suite.step("update", "updateTask patches task", async () => {
      const id = tasks[0].id;
      tasks = adapter.updateTask(tasks, id, { notes: "updated" });
      assert(tasks.find(t => t.id === id)?.notes === "updated", "notes not updated");
    });

    await suite.step("complete", "completeTask marks done", async () => {
      const id = tasks[0].id;
      tasks = adapter.completeTask(tasks, id);
      assert(tasks.find(t => t.id === id)?.status === "done", "not done");
    });

    await suite.step("reopen", "reopenTask restores progress", async () => {
      const id = tasks[0].id;
      tasks = adapter.reopenTask(tasks, id);
      assert(tasks.find(t => t.id === id)?.status === "progress", "not progress");
    });

    await suite.step("delete", "deleteTaskSoft sets deleted_at", async () => {
      const id = tasks[0].id;
      tasks = adapter.deleteTaskSoft(tasks, id, "צבי");
      assert(tasks.find(t => t.id === id)?.deleted_at, "deleted_at missing");
    });

    await suite.step("active-filter", "activeTasks excludes soft-deleted", async () => {
      const active = H.activeTasks(tasks);
      assert(!active.some(t => t.deleted_at), "deleted task in active list");
    });

    return suite.finish();
  }

  async function runTasksRepositorySuite() {
    const H = window.__validationHooks;
    const repo = H.tasksRepository;
    const suite = createSuite("tasks-repository");
    let tasks = [];

    await suite.step("load", "loadTasks returns array", async () => {
      tasks = await repo.loadTasks();
      assert(Array.isArray(tasks), "not array");
    });

    await suite.step("create", "createTask via repository", async () => {
      const task = sampleTask(`repo create ${Date.now()}`);
      tasks = await repo.createTask(tasks, task);
      assert(tasks.some(t => t.title === task.title), "created task missing");
    });

    await suite.step("update", "updateTask via repository", async () => {
      const id = tasks.find(t => t.title.includes("repo create"))?.id;
      assert(id, "test task id missing");
      tasks = await repo.updateTask(tasks, id, { notes: "repo-update" });
      assert(tasks.find(t => t.id === id)?.notes === "repo-update", "update failed");
    });

    await suite.step("complete", "completeTask via repository", async () => {
      const id = tasks.find(t => t.title.includes("repo create"))?.id;
      tasks = await repo.completeTask(tasks, id);
      assert(tasks.find(t => t.id === id)?.status === "done", "complete failed");
    });

    await suite.step("reopen", "reopenTask via repository", async () => {
      const id = tasks.find(t => t.title.includes("repo create"))?.id;
      tasks = await repo.reopenTask(tasks, id);
      assert(tasks.find(t => t.id === id)?.status === "progress", "reopen failed");
    });

    await suite.step("delete", "deleteTaskSoft via repository", async () => {
      const id = tasks.find(t => t.title.includes("repo create"))?.id;
      tasks = await repo.deleteTaskSoft(tasks, id, "צבי");
      assert(tasks.find(t => t.id === id)?.deleted_at, "soft delete failed");
    });

    return suite.finish();
  }

  async function runLocalSuppliersAdapterSuite() {
    const H = window.__validationHooks;
    const adapter = H.localSuppliersAdapter;
    const suite = createSuite("local-suppliers-adapter");
    let suppliers = [];
    const marker = `val-supplier-${Date.now()}`;

    await suite.step("create", "createSupplierOrder with link", async () => {
      suppliers = adapter.createSupplierOrder(suppliers, sampleSupplier(marker));
      assert(suppliers.some(s => s.supplier === marker), "supplier missing");
      assert(suppliers[0].links?.includes("https://example.com/validation"), "link missing");
    });

    await suite.step("update", "updateSupplierOrder patches notes", async () => {
      const id = suppliers.find(s => s.supplier === marker)?.id;
      suppliers = adapter.updateSupplierOrder(suppliers, id, { notes: "val-update" });
      assert(suppliers.find(s => s.id === id)?.notes === "val-update", "update failed");
    });

    await suite.step("stage", "updateSupplierStage toggles step", async () => {
      const id = suppliers.find(s => s.supplier === marker)?.id;
      suppliers = adapter.updateSupplierStage(suppliers, id, "order", true, H.isoDateFromOffset(0));
      const item = suppliers.find(s => s.id === id);
      assert(item?.steps?.order, "stage not set");
      assert(item?.step_dates?.order, "stage date missing");
    });

    await suite.step("mark-all", "markAllSupplierStages completes all", async () => {
      const id = suppliers.find(s => s.supplier === marker)?.id;
      suppliers = adapter.markAllSupplierStages(suppliers, id);
      const item = suppliers.find(s => s.id === id);
      assert(H.supplierSteps.every(s => item?.steps?.[s.id]), "not all stages marked");
    });

    await suite.step("soft-delete", "deleteSupplierOrderSoft sets deleted_at", async () => {
      const id = suppliers.find(s => s.supplier === marker)?.id;
      suppliers = adapter.deleteSupplierOrderSoft(suppliers, id, "עדינה");
      assert(suppliers.find(s => s.id === id)?.deleted_at, "deleted_at missing");
    });

    suite.skip("restore", "supplier restore/undelete", "not supported by application");

    return suite.finish();
  }

  async function runSuppliersRepositorySuite() {
    const H = window.__validationHooks;
    const repo = H.suppliersRepository;
    const suite = createSuite("suppliers-repository");
    let suppliers = [];

    await suite.step("load", "loadSuppliers returns array", async () => {
      suppliers = await repo.loadSuppliers();
      assert(Array.isArray(suppliers), "not array");
    });

    const marker = `repo supplier ${Date.now()}`;
    await suite.step("create", "createSupplierOrder via repository", async () => {
      suppliers = await repo.createSupplierOrder(suppliers, sampleSupplier(marker));
      assert(suppliers.some(s => s.supplier === marker), "created supplier missing");
    });

    await suite.step("update", "updateSupplierOrder via repository", async () => {
      const id = suppliers.find(s => s.supplier === marker)?.id;
      assert(id, "test supplier id missing");
      suppliers = await repo.updateSupplierOrder(suppliers, id, { notes: "repo-update" });
      assert(suppliers.find(s => s.id === id)?.notes === "repo-update", "update failed");
    });

    await suite.step("stage", "updateSupplierStage via repository", async () => {
      const id = suppliers.find(s => s.supplier === marker)?.id;
      suppliers = await repo.updateSupplierStage(suppliers, id, "order", true, H.isoDateFromOffset(0));
      const item = suppliers.find(s => s.id === id);
      assert(item?.steps?.order, "stage failed");
    });

    await suite.step("mark-all", "markAllSupplierStages via repository", async () => {
      const id = suppliers.find(s => s.supplier === marker)?.id;
      suppliers = await repo.markAllSupplierStages(suppliers, id);
      const item = suppliers.find(s => s.id === id);
      assert(H.supplierSteps.every(s => item?.steps?.[s.id]), "mark-all failed");
    });

    await suite.step("delete", "deleteSupplierOrderSoft via repository", async () => {
      const id = suppliers.find(s => s.supplier === marker)?.id;
      suppliers = await repo.deleteSupplierOrderSoft(suppliers, id, "עדינה");
      assert(suppliers.find(s => s.id === id)?.deleted_at, "soft delete failed");
    });

    return suite.finish();
  }

  async function runPermissionsSuite() {
    const H = window.__validationHooks;
    const suite = createSuite("permissions");
    const savedRole = H.state.role;
    const savedOwner = H.state.userOwner;
    const taskMine = { id: "p1", owner: "עדינה", status: "progress", deleted_at: null };
    const taskOther = { id: "p2", owner: "צבי", status: "progress", deleted_at: null };
    const supplierMine = { id: "s1", allAssignees: false, assignees: ["עדינה"] };
    const supplierOther = { id: "s2", allAssignees: false, assignees: ["צבי"] };

    try {
      H.state.role = "user";
      H.state.userOwner = "עדינה";
      await suite.step("user-access-own-task", "user canAccessTask own task", async () => {
        assert(H.canAccessTask(taskMine), "should access own task");
        assert(H.canEditTaskContent(taskMine), "should edit own active task");
      });
      await suite.step("user-deny-other-task", "user denied other task", async () => {
        assert(!H.canAccessTask(taskOther), "should not access other task");
      });
      await suite.step("user-no-delete", "user cannot deleteTask", async () => {
        assert(!H.canDeleteTask(taskMine), "user should not delete");
      });
      await suite.step("user-supplier-access", "user canAccessSupplier assigned", async () => {
        assert(H.canAccessSupplier(supplierMine), "assigned supplier");
        assert(!H.canAccessSupplier(supplierOther), "other supplier denied");
      });

      H.state.role = "manager";
      H.state.userOwner = "צבי";
      await suite.step("manager-access-all", "manager canAccessTask any task", async () => {
        assert(H.canAccessTask(taskOther), "manager sees all");
      });
      await suite.step("manager-delete", "manager canDeleteTask", async () => {
        assert(H.canDeleteTask(taskOther), "manager can delete");
      });
      await suite.step("manager-no-edit-done", "manager cannot edit done task content", async () => {
        assert(!H.canEditTaskContent({ ...taskMine, status: "done" }), "done task locked");
      });
    } finally {
      H.state.role = savedRole;
      H.state.userOwner = savedOwner;
    }

    return suite.finish();
  }

  async function runArchiveSuite() {
    const H = window.__validationHooks;
    const suite = createSuite("archive");
    const oldDone = {
      id: "arch1",
      status: "done",
      completed_at: H.isoDateFromOffset(-100),
      created_at: H.isoDateFromOffset(-100),
      deleted_at: null
    };
    const recentDone = {
      id: "arch2",
      status: "done",
      completed_at: H.isoDateFromOffset(-1),
      created_at: H.isoDateFromOffset(-1),
      deleted_at: null
    };

    await suite.step("is-archived", "isArchivedDone for 90+ day task", async () => {
      assert(H.isArchivedDone(oldDone), "old done task should archive");
      assert(!H.isArchivedDone(recentDone), "recent done task not archived");
    });

    await suite.step("visible-done", "visibleDoneTasks hides archive by default", async () => {
      const tasks = [oldDone, recentDone];
      const visible = H.visibleDoneTasks(tasks, false);
      assert(visible.some(t => t.id === "arch2"), "recent visible");
      assert(!visible.some(t => t.id === "arch1"), "archived hidden");
    });

    await suite.step("visible-done-include", "visibleDoneTasks shows archive when requested", async () => {
      const tasks = [oldDone, recentDone];
      const visible = H.visibleDoneTasks(tasks, true);
      assert(visible.some(t => t.id === "arch1"), "archived included");
    });

    return suite.finish();
  }

  async function runOrgMembersPermissionsSuite() {
    const H = window.__validationHooks;
    const suite = createSuite("org-members-permissions");
    const managerCtx = { role: "manager", userOwner: "צבי", userId: "manager-1" };
    const userCtx = { role: "user", userOwner: "עדינה", userId: "user-1" };
    let members = H.localOrgMembersAdapter.loadOrgMembers();
    const manager = members.find(m => m.role === "manager" && m.isActive);
    const regular = members.find(m => m.role === "user" && m.isActive);

    await suite.step("manager-access-admin", "manager canAccessOrgAdmin", async () => {
      assert(H.canAccessOrgAdmin(managerCtx), "manager should access admin");
      assert(!H.canAccessOrgAdmin(userCtx), "user should not access admin");
    });

    await suite.step("promote-user", "manager can promote active user", async () => {
      assert(H.canPromoteMember(managerCtx, regular), "should promote user");
      const result = await H.orgMembersRepository.promoteMember(members, regular.userId, managerCtx);
      assert(result.ok, result.reason || "promote failed");
      members = result.members;
      assert(members.find(m => m.userId === regular.userId)?.role === "manager", "not promoted");
    });

    await suite.step("demote-manager", "manager can demote when another manager exists", async () => {
      const promoted = members.find(m => m.userId === regular.userId);
      assert(H.canDemoteMember(managerCtx, members, promoted), "should demote extra manager");
      const result = await H.orgMembersRepository.demoteMember(members, promoted.userId, managerCtx);
      assert(result.ok, result.reason || "demote failed");
      members = result.members;
    });

    await suite.step("last-manager-block-demote", "last manager cannot be demoted", async () => {
      const lastManager = members.find(m => m.role === "manager" && m.isActive);
      assert(H.isLastActiveManager(members, lastManager.userId), "should be last manager");
      assert(!H.canDemoteMember(managerCtx, members, lastManager), "demote blocked");
      const result = await H.orgMembersRepository.demoteMember(members, lastManager.userId, managerCtx);
      assert(!result.ok && result.code === "last_manager", "expected last_manager error");
    });

    await suite.step("deactivate-user", "manager can deactivate user", async () => {
      const target = members.find(m => m.role === "user" && m.isActive);
      const result = await H.orgMembersRepository.deactivateMember(members, target.userId, managerCtx);
      assert(result.ok, result.reason || "deactivate failed");
      members = result.members;
      assert(!members.find(m => m.userId === target.userId)?.isActive, "still active");
    });

    await suite.step("reactivate-user", "manager can reactivate user", async () => {
      const target = members.find(m => m.role === "user" && !m.isActive);
      const result = await H.orgMembersRepository.reactivateMember(members, target.userId, managerCtx);
      assert(result.ok, result.reason || "reactivate failed");
      members = result.members;
      assert(members.find(m => m.userId === target.userId)?.isActive, "still inactive");
    });

    await suite.step("last-manager-block-deactivate", "last manager cannot be deactivated", async () => {
      const lastManager = members.find(m => m.role === "manager" && m.isActive);
      assert(!H.canDeactivateMember(managerCtx, members, lastManager), "deactivate blocked");
      const result = await H.orgMembersRepository.deactivateMember(members, lastManager.userId, managerCtx);
      assert(!result.ok && result.code === "last_manager", "expected last_manager error");
    });

    await suite.step("user-route-guard", "regular user cannot access org admin route", async () => {
      const savedRole = H.state.role;
      H.state.role = "user";
      const blocked = H.guardManagerAdminView ? H.guardManagerAdminView("mgmt-members") : "all";
      H.state.role = savedRole;
      assert(blocked === "all", "user should be redirected away from mgmt-members");
    });

    return suite.finish();
  }

  async function runOrgMembersPageSuite() {
    const H = window.__validationHooks;
    const suite = createSuite("org-members-page");
    const saved = { role: H.state.role, view: H.state.view, orgMembers: H.state.orgMembers, orgMembersLoaded: H.state.orgMembersLoaded };

    try {
      H.state.role = "manager";
      H.state.orgMembers = H.localOrgMembersAdapter.loadOrgMembers();
      H.state.orgMembersLoaded = true;
      H.state.orgMembersLoading = false;
      H.state.orgMembersError = "";
      H.state.view = "mgmt-members";
      H.render();
      await suite.step("page-load", "Organization Members page renders list", async () => {
        const text = document.getElementById("app")?.innerText || "";
        assert(text.includes("חברי ארגון"), "title missing");
        assert(text.includes("עדינה") || text.includes("צבי"), "member missing");
      });
    } finally {
      H.state.role = saved.role;
      H.state.view = saved.view;
      H.state.orgMembers = saved.orgMembers;
      H.state.orgMembersLoaded = saved.orgMembersLoaded;
      H.render();
    }

    return suite.finish();
  }

  async function runAdaptersBundleSuite() {
    const suite = createSuite("adapters-bundle");
    const A = window.BatAyinAdapters;

    await suite.step("global", "BatAyinAdapters global exists", async () => {
      assert(A, "BatAyinAdapters missing");
    });

    for (const name of [
      "createSupabaseTasksAdapter",
      "createSupabaseSuppliersAdapter",
      "createSupabaseOrgMembersAdapter",
      "normalizeTask",
      "normalizeSupplier",
      "createAsyncRepository",
      "loadSupabaseTasksWriteContext",
      "mapAppTaskToSupabaseInsert",
      "canAccessOrgAdmin",
      "canPromoteMember",
      "canDemoteMember"
    ]) {
      await suite.step(`export-${name}`, `export ${name}`, async () => {
        assert(typeof A[name] === "function", `${name} not a function`);
      });
    }

    return suite.finish();
  }

  async function runAuthApiSuite() {
    const suite = createSuite("auth-api");

    for (const fn of [
      "debugSupabaseSignInWithGoogle",
      "debugSupabaseSignOut",
      "bootstrapSupabaseAuthSession",
      "consumeSupabaseOAuthCallback"
    ]) {
      await suite.step(`fn-${fn}`, `${fn} exposed`, async () => {
        assert(typeof window[fn] === "function", `${fn} missing`);
      });
    }

    await suite.step("bootstrap-shape", "bootstrapSupabaseAuthSession returns shape", async () => {
      const result = await window.bootstrapSupabaseAuthSession();
      assert(typeof result.ok === "boolean", "ok missing");
      assert("session" in result, "session missing");
      assert("restored" in result, "restored missing");
    });

    suite.skip("google-login", "interactive Google OAuth login", "requires manual browser OAuth — use debugSupabaseSignInWithGoogle()");

    suite.skip("session-restore-live", "session restore after reload", "requires prior OAuth session in profile");

    return suite.finish();
  }

  async function runSupabaseSuite(options) {
    const H = window.__validationHooks;
    const suite = createSuite("supabase-integration");

    await suite.step("connection", "testSupabaseConnection", async () => {
      const result = await window.testSupabaseConnection();
      assert(result.ok, result.reason || "connection failed");
    });

    if (H.DATA_BACKEND !== "supabase") {
      suite.skip("task-crud", "testSupabaseTaskCrudViaRepository", "DATA_BACKEND=local — use ?debugBackend=supabase for live CRUD");
      suite.skip("supplier-crud", "testSupabaseSupplierCrud", "requires debug backend + session");
      suite.skip("read-isolation", "testSupabaseReadStateIsolation", "requires debug backend");
      return suite.finish();
    }

    const { data } = await H.supabaseClient.auth.getSession();
    if (!data?.session) {
      suite.skip("task-crud", "testSupabaseTaskCrudViaRepository", "no Supabase auth session");
      suite.skip("supplier-crud", "testSupabaseSupplierCrud", "no Supabase auth session");
      suite.skip("read-isolation", "testSupabaseReadStateIsolation", "no Supabase auth session");
      if (options.requireSupabase) {
        await suite.step("auth-required", "Supabase session required but missing", async () => {
          throw new Error("Set SUPABASE_TEST_PASSWORD or sign in via OAuth before validate --require-supabase");
        });
      }
      return suite.finish();
    }

    await suite.step("read-isolation", "testSupabaseReadStateIsolation", async () => {
      const result = await window.testSupabaseReadStateIsolation();
      assert(result.ok && result.sameReference, "state.tasks mutated on read");
    });

    await suite.step("task-crud", "testSupabaseTaskCrudViaRepository", async () => {
      const result = await window.testSupabaseTaskCrudViaRepository();
      assert(result.ok, `failed steps: ${(result.failed || []).join(", ")}`);
      return { passed: result.passed };
    });

    await suite.step("supplier-crud", "testSupabaseSupplierCrud", async () => {
      const result = await window.testSupabaseSupplierCrud();
      assert(result.ok, `failed steps: ${(result.failed || []).join(", ")}`);
      return { passed: result.passed };
    });

    return suite.finish();
  }

  async function runAll(options = {}) {
    await window.__appReady;
    const snap = snapshotStorage();
    const results = [];
    try {
      results.push(await runAdaptersBundleSuite());
      results.push(await runLocalTasksAdapterSuite());
      results.push(await runTasksRepositorySuite());
      results.push(await runLocalSuppliersAdapterSuite());
      results.push(await runSuppliersRepositorySuite());
      results.push(await runPermissionsSuite());
      results.push(await runOrgMembersPermissionsSuite());
      results.push(await runOrgMembersPageSuite());
      results.push(await runArchiveSuite());
      results.push(await runAuthApiSuite());
      if (options.supabase !== false) {
        results.push(await runSupabaseSuite(options));
      }
    } finally {
      restoreStorage(snap);
      const H = window.__validationHooks;
      await H.bootstrapSuppliers();
      await H.bootstrapTasks();
    }
    return results;
  }

  function snapshotStorage() {
    const keys = ["beit-tasks", "beit-suppliers", "beit-version"];
    const snap = {};
    for (const k of keys) snap[k] = localStorage.getItem(k);
    const H = window.__validationHooks;
    snap._stateTasks = JSON.stringify(H.state.tasks);
    snap._stateSuppliers = JSON.stringify(H.state.suppliers);
    return snap;
  }

  function restoreStorage(snap) {
    const keys = ["beit-tasks", "beit-suppliers", "beit-version"];
    for (const k of keys) {
      if (snap[k] == null) localStorage.removeItem(k);
      else localStorage.setItem(k, snap[k]);
    }
    const H = window.__validationHooks;
    H.state.tasks = JSON.parse(snap._stateTasks);
    H.state.suppliers = JSON.parse(snap._stateSuppliers);
  }

  window.__validation = {
    ready: Boolean(window.__validationHooks),
    runAll,
    runSuite: async (name, options) => {
      await window.__appReady;
      const map = {
        "local-tasks-adapter": runLocalTasksAdapterSuite,
        "tasks-repository": runTasksRepositorySuite,
        "local-suppliers-adapter": runLocalSuppliersAdapterSuite,
        "suppliers-repository": runSuppliersRepositorySuite,
        permissions: runPermissionsSuite,
        "org-members-permissions": runOrgMembersPermissionsSuite,
        "org-members-page": runOrgMembersPageSuite,
        archive: runArchiveSuite,
        "adapters-bundle": runAdaptersBundleSuite,
        "auth-api": runAuthApiSuite,
        "supabase-integration": () => runSupabaseSuite(options)
      };
      const fn = map[name];
      if (!fn) throw new Error(`unknown suite: ${name}`);
      return fn(options);
    }
  };
})();
