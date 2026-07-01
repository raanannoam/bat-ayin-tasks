/** מסכי משימות — רשימות, פרטים, טפסים */
var TaskScreens = {};

TaskScreens.list = (sort = "date") => {
  Store.lastList = sort === "priority" ? "tasks/priority" : sort === "category" ? "tasks/category" : "tasks";
  const open = sortTasks(Store.openTasks(false), sort);
  const today = open.filter((t) => t.due === "today" || t.dueLabel === "היום");
  const rest = open.filter((t) => t.due !== "today" && t.dueLabel !== "היום");
  const allDone = sortTasks(Store.doneTasks(false), sort);
  const { recent: recentDone, archived: archivedDone } = Store.splitDoneItems(allDone, (t) => Store.isArchivedTask(t));

  const doneSection = doneGroupSection({
    kind: "tasks",
    totalCount: allDone.length,
    recentCount: recentDone.length,
    archivedCount: archivedDone.length,
    isOpen: Store.showCompletedTasks,
    showArchive: Store.showTaskDoneArchive,
    recentItems: recentDone,
    archivedItems: archivedDone,
    renderItems: (items, emptyMsg) => items.length
      ? `<div class="task-list">${items.map((t) => taskRow(t)).join("")}</div>`
      : `<p class="done-hint muted">${esc(emptyMsg)}</p>`,
    emptyRecentMsg: "אין משימות שהושלמו בחודש האחרון.",
    emptyAllMsg: "עדיין לא סימנתם משימות כהושלמו."
  });

  return `
    <div class="screen">
      <div class="screen-section">
        <h1>משימות</h1>
        <p class="muted small">${open.length} פתוחות · ${allDone.length} הושלמו</p>
        ${sortChips(sort, "tasks")}
      </div>
      ${today.length ? `<div class="screen-section"><span class="section-label">להיום · ${today.length}</span>${taskList(today, "", null)}</div>` : ""}
      <section class="task-group">
        <h2 class="task-group-title">${today.length ? "שאר המשימות" : "פתוחות"} · ${rest.length || open.length}</h2>
        ${taskList(rest.length ? rest : open, "אין משימות פתוחות", "task/create")}
      </section>
      ${doneSection}
    </div>`;
};

TaskScreens.detail = (id) => {
  const task = Store.getTask(id);
  if (!task || !Store.canAccessTask(task)) {
    return `<div class="screen">${backBar("חזרה", Store.lastList || "tasks")}<h1>המשימה לא נמצאה</h1></div>`;
  }
  const done = task.status === "done";
  const canEdit = !done && (Store.isManager() || task.owner === Store.displayName);
  const updates = (task.updates || []).map((u) =>
    `<div class="detail-block"><span class="detail-block__label">${esc(u.by)} · ${formatDateHe(u.created_at)}</span><span class="detail-block__value">${esc(u.text)}</span></div>`
  ).join("");

  return `
    <div class="screen screen--detail">
      ${backBar("משימות", Store.lastList || "tasks")}
      <div class="screen-section">
        <h1>${esc(task.title)}</h1>
        <div class="chip-row">
          <span class="chip is-active">${categoryIcon(task.category)} ${esc(Store.catLabel(task.category))}</span>
          ${done ? '<span class="badge badge--done">הושלם</span>' : `<span class="badge badge--today">${esc(task.dueLabel)}</span>`}
          ${task.priority === "high" ? '<span class="badge badge--overdue">דחוף</span>' : ""}
        </div>
      </div>

      <div class="detail-block"><span class="detail-block__label">מבצע</span><span class="detail-block__value">${esc(task.owner)}</span></div>
      <div class="detail-block"><span class="detail-block__label">הערות</span><span class="detail-block__value">${esc(task.notes || "—")}</span></div>
      <div class="detail-block"><span class="detail-block__label">תזכורת</span><span class="detail-block__value muted">לא מוגדר (קריאה בלבד)</span></div>

      ${updates ? `<div class="screen-section"><span class="section-label">עדכונים</span>${updates}
        <button class="btn btn--ghost btn--block" type="button" data-action="add-update" data-id="${id}">${icon("add")} הוסף עדכון</button>
      </div>` : `<button class="btn btn--ghost btn--block" type="button" data-action="add-update" data-id="${id}">${icon("add")} הוסף עדכון</button>`}

      <div id="updateFormWrap"></div>

      <div class="chip-row">
        ${canEdit ? `<button class="btn btn--primary btn--block" type="button" data-route="task/${id}/edit">${icon("edit")} עריכה</button>` : ""}
        ${!done ? `<button class="btn btn--ghost btn--block" type="button" data-action="complete" data-id="${id}">${icon("done")} סמן כהושלם</button>` : ""}
        ${done && Store.isManager() ? `<button class="btn btn--ghost btn--block" type="button" data-action="reopen" data-id="${id}">פתח מחדש</button>` : ""}
        ${Store.isManager() ? `<button class="btn btn--danger btn--block" type="button" data-action="delete-task" data-id="${id}">${icon("trash")} מחק משימה</button>` : ""}
      </div>
    </div>`;
};

TaskScreens.form = (id) => {
  const task = id ? Store.getTask(id) : null;
  const isEdit = Boolean(task);
  const isMgr = Store.isManager();
  const dueOpts = [["today", "היום"], ["tomorrow", "מחר"], ["none", "ללא"]];

  return `
    <div class="screen">
      ${backBar(isEdit ? "פרטי משימה" : "משימות", isEdit ? `task/${id}` : Store.lastList || "tasks")}
      <h1>${isEdit ? "עריכת משימה" : "משימה חדשה"}</h1>
      <form class="screen-section" id="taskForm" data-id="${esc(id || "")}">
        <div class="form-field"><label for="title">כותרת</label>
          <input class="form-input" id="title" required value="${esc(task?.title || "")}" placeholder="מה צריך לעשות?"></div>
        ${isMgr && !isEdit ? `<div class="form-field"><label for="owner">מבצע</label>
          <select class="form-input" id="owner">${Store.people.map((p) =>
            `<option value="${esc(p)}" ${p === Store.displayName ? "selected" : ""}>${esc(p)}</option>`).join("")}</select></div>` : ""}
        <div class="form-field"><label>קטגוריה</label>
          <div class="chip-row" id="catChips">${Store.categories.map((c) =>
            `<button type="button" class="chip ${(task?.category || "office") === c.id ? "is-active" : ""}" data-cat="${c.id}">${categoryIcon(c.id)} ${esc(c.label)}</button>`
          ).join("")}</div></div>
        <div class="form-field"><label>תאריך יעד</label>
          <div class="segmented" id="dueSeg">${dueOpts.map(([k, l]) =>
            `<button type="button" class="${(task?.due || "today") === k ? "is-active" : ""}" data-due="${k}">${l}</button>`
          ).join("")}</div></div>
        <div class="form-field"><label>עדיפות</label>
          <div class="segmented" id="priSeg">
            <button type="button" class="${(task?.priority || "normal") === "normal" ? "is-active" : ""}" data-pri="normal">רגילה</button>
            <button type="button" class="${task?.priority === "high" ? "is-active" : ""}" data-pri="high">דחופה</button>
          </div></div>
        <div class="form-field"><label for="notes">הערות</label>
          <textarea class="form-input" id="notes">${esc(task?.notes || "")}</textarea></div>
        <button class="btn btn--primary btn--block" type="submit">${isEdit ? "שמירה" : "יצירת משימה"}</button>
      </form>
    </div>`;
};
