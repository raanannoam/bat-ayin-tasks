/** אפליקציה — bootstrap, אירועים, CRUD */
(function initApp() {
  const header = document.getElementById("appHeader");
  const main = document.getElementById("appMain");
  const nav = document.getElementById("bottomNav");
  const fab = document.getElementById("fab");
  const dialog = document.getElementById("confirmDialog");
  const toastEl = document.getElementById("toast");
  let formState = { category: "office", due: "today", priority: "normal", assignees: [Store.displayName], allAssignees: false };
  let clearStep = 0;

  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-visible");
    setTimeout(() => toastEl.classList.remove("is-visible"), 2200);
  }

  function confirmDialog(title, msg, onConfirm) {
    document.getElementById("dialogTitle").textContent = title;
    document.getElementById("dialogMessage").textContent = msg;
    Store.pendingConfirm = onConfirm;
    dialog.showModal();
  }

  function renderHeader(name) {
    if (isAuthScreen(name)) {
      header.className = "app-header app-header--minimal";
      header.innerHTML = `<span class="header-title">משימות ישיבת בת עין</span>`;
      return;
    }
    if (isDetailScreen(name)) {
      header.className = "app-header app-header--minimal";
      header.innerHTML = `<span class="header-title">משימות ישיבת בת עין</span>
        <div class="header-actions"><button class="icon-btn" type="button" data-theme-toggle>${icon("moon")}</button></div>`;
      return;
    }
    const role = Store.isManager() ? `מנהל · ${Store.displayName}` : Store.displayName;
    header.className = "app-header";
    header.innerHTML = `
      <div class="header-greeting"><span>שלום,</span><strong>${esc(role)}</strong></div>
      <div class="header-actions">
        <button class="icon-btn" type="button" data-route="settings" aria-label="העדפות">${icon("settings")}</button>
        <button class="icon-btn" type="button" data-theme-toggle aria-label="מצב כהה">${icon("moon")}</button>
      </div>`;
  }

  function renderNav(name) {
    if (isAuthScreen(name)) { nav.hidden = true; return; }
    nav.hidden = false;
    const active = activeNavRoute(name);
    nav.innerHTML = navItems().map((item) =>
      `<button class="bottom-nav__item ${active === item.route ? "is-active" : ""}" type="button" data-route="${item.route}">
        ${icon(item.icon)}<span>${item.label}</span></button>`
    ).join("");
  }

  function render() {
    const { name, params } = parseRoute(location.hash);
    if (Store.auth !== "signed_in" && !isAuthScreen(name)) {
      location.hash = "login";
      return;
    }
    if (name.startsWith("manage") && !Store.isManager()) {
      showToast("אין הרשאה");
      location.hash = "today";
      return;
    }
    renderHeader(name);
    main.className = `app-main ${showFab(name) ? "" : "app-main--no-fab"} ${isDetailScreen(name) ? "app-main--sheet" : ""}`;
    main.innerHTML = renderRoute(location.hash);
    syncFormState(name, params);
    renderNav(name);
    fab.hidden = !showFab(name);
    fab.onclick = () => { location.hash = fabRoute(name); };
    window.scrollTo(0, 0);
  }

  function navigate(route) { location.hash = route; }

  function syncFormState(name, params) {
    if (name === "taskEdit" && params?.id) {
      const t = Store.getTask(params.id);
      if (t) formState = { category: t.category, due: t.due || "today", priority: t.priority || "normal" };
    }
    if (name === "taskCreate") formState = { category: "office", due: "today", priority: "normal" };
    if (name === "supplierEdit" && params?.id) {
      const s = Store.getSupplier(params.id);
      if (s) formState = { assignees: [...(s.assignees || [])], allAssignees: !!s.allAssignees };
    }
    if (name === "supplierCreate") formState = { assignees: [Store.displayName], allAssignees: false };
  }

  document.addEventListener("click", (e) => {
    const routeBtn = e.target.closest("[data-route]");
    if (routeBtn) {
      e.preventDefault();
      const pre = routeBtn.dataset.prefill;
      if (pre && routeBtn.dataset.route === "supplier/create") {
        sessionStorage.setItem("pv2_prefill", pre);
      }
      navigate(routeBtn.dataset.route);
      return;
    }

    const sortBtn = e.target.closest("[data-sort]");
    if (sortBtn) {
      navigate(`${sortBtn.dataset.sortBase || "tasks"}/${sortBtn.dataset.sort}`);
      return;
    }

    if (e.target.closest("[data-theme-toggle]")) {
      const dark = document.documentElement.getAttribute("data-theme") === "dark";
      document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
      Store.prefs.dark = !dark;
    }

    const action = e.target.closest("[data-action]");
    if (!action) return;
    const act = action.dataset.action;
    const id = action.dataset.id;

    if (act === "sign-in") { Store.auth = "signed_in"; navigate(Store.isManager() ? "today" : "today"); render(); }
    if (act === "sign-out") { Store.auth = "signed_out"; navigate("login"); render(); }
    if (act === "complete") { Store.completeTask(id); showToast("המשימה הושלמה"); render(); }
    if (act === "reopen") { Store.reopenTask(id); showToast("המשימה נפתחה מחדש"); render(); }
    if (act === "toggle-completed-tasks") {
      Store.showCompletedTasks = !Store.showCompletedTasks;
      if (!Store.showCompletedTasks) Store.showTaskDoneArchive = false;
      render();
    }
    if (act === "show-task-archive") { Store.showTaskDoneArchive = true; render(); }
    if (act === "toggle-completed-suppliers") {
      Store.showCompletedSuppliers = !Store.showCompletedSuppliers;
      if (!Store.showCompletedSuppliers) Store.showSupplierDoneArchive = false;
      render();
    }
    if (act === "show-supplier-archive") { Store.showSupplierDoneArchive = true; render(); }
    if (act === "toggle-step") {
      const done = Store.toggleSupplierStep(id, action.dataset.step);
      showToast(done ? "ההזמנה הושלמה!" : "שלב עודכן");
      render();
    }
    if (act === "mark-all") { Store.markAllSupplierStages(id); showToast("כל השלבים סומנו"); render(); }
    if (act === "delete-task") {
      confirmDialog("למחוק את המשימה?", "המשימה תוסתר מהרשימות.", () => {
        Store.deleteTaskSoft(id); showToast("המשימה נמחקה"); navigate(Store.lastList || "tasks");
      });
    }
    if (act === "delete-supplier") {
      confirmDialog("למחוק את ההזמנה?", "ההזמנה תוסתר מהרשימות.", () => {
        Store.deleteSupplierSoft(id); showToast("ההזמנה נמחקה"); navigate("suppliers");
      });
    }
    if (act === "switch-role") {
      Store.role = action.dataset.role;
      Store.userId = action.dataset.role === "manager" ? "u1" : "u2";
      Store.displayName = action.dataset.role === "manager" ? "עדינה" : "אבי";
      showToast(`מצב ${action.dataset.role === "manager" ? "מנהל" : "משתמש"}`);
      render();
    }
    if (act === "toggle-invite") {
      const f = document.getElementById("inviteForm");
      if (f) f.hidden = !f.hidden;
    }
    if (act === "add-update") {
      const wrap = document.getElementById("updateFormWrap");
      if (wrap) wrap.innerHTML = `<form id="updateForm" class="form-field" data-id="${id}">
        <textarea class="form-input" id="updateText" placeholder="עדכון חדש..." required></textarea>
        <button class="btn btn--primary btn--block" type="submit">שמירה</button></form>`;
    }
    if (act === "member-promote") handleMember(id, "promote");
    if (act === "member-demote") handleMember(id, "demote");
    if (act === "member-deactivate") handleMember(id, "deactivate");
    if (act === "member-reactivate") handleMember(id, "reactivate");
    if (act === "clear-tasks-step1") handleClearTasks();
    document.querySelectorAll("[data-cat]").forEach((b) => {
      if (e.target === b) { formState.category = b.dataset.cat; b.parentElement.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active")); b.classList.add("is-active"); }
    });
    document.querySelectorAll("[data-due]").forEach((b) => {
      if (e.target === b) { formState.due = b.dataset.due; b.parentElement.querySelectorAll("button").forEach((c) => c.classList.remove("is-active")); b.classList.add("is-active"); }
    });
    document.querySelectorAll("[data-pri]").forEach((b) => {
      if (e.target === b) { formState.priority = b.dataset.pri; b.parentElement.querySelectorAll("button").forEach((c) => c.classList.remove("is-active")); b.classList.add("is-active"); }
    });
    document.querySelectorAll("[data-assign]").forEach((b) => {
      if (e.target !== b) return;
      if (b.dataset.assign === "all") { formState.allAssignees = true; formState.assignees = []; }
      else {
        formState.allAssignees = false;
        const name = b.dataset.assign;
        formState.assignees = formState.assignees.includes(name) ? formState.assignees.filter((x) => x !== name) : [...formState.assignees, name];
      }
      b.parentElement.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
      b.parentElement.querySelectorAll(".chip").forEach((c) => {
        if (c.dataset.assign === "all" && formState.allAssignees) c.classList.add("is-active");
        if (!formState.allAssignees && formState.assignees.includes(c.dataset.assign)) c.classList.add("is-active");
      });
    });
    document.querySelectorAll("[data-text]").forEach((b) => {
      if (e.target === b) { Store.prefs.text = b.dataset.text; document.body.dataset.textSize = b.dataset.text; b.parentElement.querySelectorAll("button").forEach((c) => c.classList.remove("is-active")); b.classList.add("is-active"); }
    });
  });

  function handleMember(userId, action) {
    const m = Store.members.find((x) => x.userId === userId);
    if (!m) return;
    const labels = { promote: "לקדם למנהל?", demote: "להוריד למשתמש?", deactivate: "להשבית?", reactivate: "להפעיל?" };
    confirmDialog(labels[action], m.displayName, () => {
      if (action === "promote") m.role = "manager";
      if (action === "demote") m.role = "user";
      if (action === "deactivate") m.isActive = false;
      if (action === "reactivate") m.isActive = true;
      showToast("עודכן");
      render();
    });
  }

  function handleClearTasks() {
    const wrap = document.getElementById("clearConfirm");
    if (!wrap) return;
    clearStep++;
    if (clearStep === 1) wrap.innerHTML = `<button class="btn btn--danger btn--block" type="button" data-action="clear-tasks-step1">לחץ שוב לאישור</button>`;
    if (clearStep === 2) wrap.innerHTML = `<button class="btn btn--danger btn--block" type="button" data-action="clear-tasks-step1">לחיצה אחרונה — מחיקה!</button>`;
    if (clearStep >= 3) { Store.tasks = []; clearStep = 0; showToast("כל המשימות נמחקו"); render(); }
  }

  document.getElementById("dialogCancel").onclick = () => dialog.close();
  document.getElementById("dialogConfirm").onclick = () => {
    dialog.close();
    try { Store.pendingConfirm?.(); } catch { showToast("שגיאה"); }
    Store.pendingConfirm = null;
  };

  document.addEventListener("submit", (e) => {
    if (e.target.id === "taskForm") {
      e.preventDefault();
      const editId = e.target.dataset.id;
      const title = document.getElementById("title").value.trim();
      if (!title) return;
      const ownerEl = document.getElementById("owner");
      const owner = ownerEl ? ownerEl.value : Store.displayName;
      const dueLabels = { today: "היום", tomorrow: "מחר", none: "ללא תאריך" };
      const payload = { title, category: formState.category, owner, assigneeId: Store.members.find((m) => m.displayName === owner)?.userId, due: formState.due, dueLabel: dueLabels[formState.due], priority: formState.priority, notes: document.getElementById("notes").value, status: "progress", updates: [] };
      if (editId) { Object.assign(Store.getTask(editId), payload); navigate(`task/${editId}`); }
      else { Store.tasks.unshift({ ...payload, id: Store.nextId("t") }); navigate(`task/${Store.tasks[0].id}`); }
      showToast("נשמר"); render();
    }
    if (e.target.id === "supplierForm") {
      e.preventDefault();
      const editId = e.target.dataset.id;
      if (!formState.allAssignees && !formState.assignees.length) { showToast("יש לבחור אחראים"); return; }
      const payload = {
        supplier: document.getElementById("supplier").value.trim(),
        description: document.getElementById("description").value,
        amount: document.getElementById("amount").value,
        due_date: document.getElementById("due_date").value,
        assignees: formState.allAssignees ? [] : formState.assignees,
        allAssignees: formState.allAssignees,
        links: document.getElementById("links").value.split("\n").filter(Boolean),
        document_notes: document.getElementById("document_notes").value,
        notes: document.getElementById("notes").value,
        steps: { order: false, received: false, payment: false, invoice: false },
        step_dates: { order: "", received: "", payment: "", invoice: "" }
      };
      if (editId) { Object.assign(Store.getSupplier(editId), payload); navigate(`supplier/${editId}`); }
      else { Store.suppliers.unshift({ ...payload, id: Store.nextId("s") }); navigate(`supplier/${Store.suppliers[0].id}`); }
      showToast("נשמר"); render();
    }
    if (e.target.id === "updateForm") {
      e.preventDefault();
      const t = Store.getTask(e.target.dataset.id);
      const text = document.getElementById("updateText").value.trim();
      if (t && text) t.updates.push({ id: Store.nextId("u"), by: Store.displayName, text, created_at: new Date().toISOString().slice(0, 10) });
      showToast("עדכון נוסף"); render();
    }
    if (e.target.id === "inviteFormEl") {
      e.preventDefault();
      showToast("ההזמנה נשמרה — שליחת אימייל תגיע בהמשך");
      e.target.reset();
    }
  });

  window.addEventListener("hashchange", render);
  if (!location.hash || location.hash === "#") location.hash = Store.auth === "signed_in" ? "today" : "login";
  render();
})();
