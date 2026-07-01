/** מסכי ספקים — רשימה, פרטים, יצירה */
var SupplierScreens = {};

SupplierScreens.list = () => {
  const list = Store.visibleSuppliers();
  const open = list.filter((s) => Store.supplierProgress(s.steps) < 100);
  const done = list.filter((s) => Store.supplierProgress(s.steps) === 100);
  const { recent: recentDone, archived: archivedDone } = Store.splitDoneItems(done, (s) => Store.isArchivedSupplier(s));
  const chips = [...new Set(list.map((s) => s.supplier))].slice(0, 4);

  const doneSection = doneGroupSection({
    kind: "suppliers",
    totalCount: done.length,
    recentCount: recentDone.length,
    archivedCount: archivedDone.length,
    isOpen: Store.showCompletedSuppliers,
    showArchive: Store.showSupplierDoneArchive,
    recentItems: recentDone,
    archivedItems: archivedDone,
    renderItems: (items, emptyMsg) => items.length
      ? `<div class="task-list">${items.map((s) => supplierRow(s)).join("")}</div>`
      : `<p class="done-hint muted">${esc(emptyMsg)}</p>`,
    emptyRecentMsg: "אין הזמנות שהושלמו בחודש האחרון.",
    emptyAllMsg: "אין הזמנות שהושלמו."
  });

  const openBody = open.length
    ? `<div class="task-list">${open.map((s) => supplierRow(s)).join("")}</div>`
    : emptyState("suppliers", "אין הזמנות פתוחות", "supplier/create");

  return `
    <div class="screen">
      <div class="screen-section">
        <h1>ספקים</h1>
        <p class="muted small">${open.length} פתוחות · ${done.length} הושלמו</p>
        ${statCards([[open.length, "פתוחות"], [done.length, "הושלמו"]])}
        ${chips.length ? `<div class="chip-row"><span class="muted small">יצירה מהירה:</span>
          ${chips.map((n) => `<button class="chip" type="button" data-route="supplier/create" data-prefill="${esc(n)}">${esc(n)}</button>`).join("")}
        </div>` : ""}
      </div>
      <section class="task-group">
        <h2 class="task-group-title">פתוחות · ${open.length}</h2>
        ${openBody}
      </section>
      ${doneSection}
    </div>`;
};

SupplierScreens.detail = (id) => {
  const s = Store.getSupplier(id);
  if (!s || !Store.canAccessSupplier(s)) {
    return `<div class="screen">${backBar("ספקים", "suppliers")}<h1>ההזמנה לא נמצאה</h1></div>`;
  }
  const pct = Store.supplierProgress(s.steps);

  return `
    <div class="screen">
      ${backBar("ספקים", "suppliers")}
      <div class="screen-section">
        <h1>${esc(s.supplier)}</h1>
        <p class="muted">${esc(s.description)}</p>
        <div class="chip-row"><span class="chip is-active">${icon("money")} ${esc(s.amount || "—")}</span>
          <span class="badge ${pct === 100 ? "badge--done" : "badge--today"}">${pct}%</span></div>
      </div>

      <div class="screen-section">
        <span class="section-label">שלבי הזמנה</span>
        <div class="step-track">${Store.stepLabels.map((st) => {
          const done = s.steps[st.key];
          const current = !done && Store.stepLabels.every((x) => x.key === st.key || s.steps[x.key]);
          return `<button type="button" class="step-pill ${done ? "is-done" : current ? "is-current" : ""}" data-action="toggle-step" data-id="${id}" data-step="${st.key}">
            ${done ? icon("done") : ""}${esc(st.label)}<small>${formatDateHe(s.step_dates[st.key])}</small></button>`;
        }).join("")}</div>
        <button class="btn btn--ghost btn--block" type="button" data-action="mark-all" data-id="${id}">סמן הכל</button>
      </div>

      <div class="detail-block"><span class="detail-block__label">אחראים</span>
        <span class="detail-block__value">${s.allAssignees ? "כולם" : esc(s.assignees.join(", "))}</span></div>
      <div class="detail-block"><span class="detail-block__label">הערות מסמכים</span>
        <span class="detail-block__value">${esc(s.document_notes || "—")}</span></div>
      <div class="detail-block"><span class="detail-block__label">קישורים</span>
        <span class="detail-block__value">${(s.links || []).length ? s.links.map((l) => `<a href="${esc(l)}" target="_blank">${icon("link")} ${esc(l)}</a>`).join("<br>") : "—"}</span></div>
      <div class="detail-block"><span class="detail-block__label">הערות</span><span class="detail-block__value">${esc(s.notes || "—")}</span></div>

      <button class="btn btn--primary btn--block" type="button" data-route="supplier/${id}/edit">${icon("edit")} עריכה</button>
      <button class="btn btn--danger btn--block" type="button" data-action="delete-supplier" data-id="${id}">${icon("trash")} מחק הזמנה</button>
    </div>`;
};

SupplierScreens.form = (id, prefill) => {
  const s = id ? Store.getSupplier(id) : null;
  const isEdit = Boolean(s);
  const name = prefill || s?.supplier || "";

  return `
    <div class="screen">
      ${backBar(isEdit ? "פרטי הזמנה" : "ספקים", isEdit ? `supplier/${id}` : "suppliers")}
      <h1>${isEdit ? "עריכת הזמנה" : "הזמנת ספק חדשה"}</h1>
      <form class="screen-section" id="supplierForm" data-id="${esc(id || "")}">
        <div class="form-field"><label for="supplier">שם ספק</label>
          <input class="form-input" id="supplier" required value="${esc(name)}"></div>
        <div class="form-field"><label for="description">תיאור</label>
          <input class="form-input" id="description" value="${esc(s?.description || "")}"></div>
        <div class="form-field"><label for="amount">סכום</label>
          <input class="form-input" id="amount" value="${esc(s?.amount || "")}" placeholder="₪680"></div>
        <div class="form-field"><label for="due_date">תאריך יעד</label>
          <input class="form-input" id="due_date" type="date" value="${esc(s?.due_date || "")}"></div>
        <div class="form-field"><label>אחראים</label>
          <div class="chip-row" id="assigneeChips">
            <button type="button" class="chip ${s?.allAssignees ? "is-active" : ""}" data-assign="all">כולם</button>
            ${Store.people.map((p) =>
              `<button type="button" class="chip ${!s?.allAssignees && (s?.assignees || [Store.displayName]).includes(p) ? "is-active" : ""}" data-assign="${esc(p)}">${esc(p)}</button>`
            ).join("")}
          </div></div>
        <div class="form-field"><label for="links">קישורים (שורה לכל קישור)</label>
          <textarea class="form-input" id="links">${esc((s?.links || []).join("\n"))}</textarea></div>
        <div class="form-field"><label for="document_notes">הערות מסמכים</label>
          <textarea class="form-input" id="document_notes">${esc(s?.document_notes || "")}</textarea></div>
        <div class="form-field"><label for="notes">הערות</label>
          <textarea class="form-input" id="notes">${esc(s?.notes || "")}</textarea></div>
        <button class="btn btn--primary btn--block" type="submit">${isEdit ? "שמירה" : "יצירת הזמנה"}</button>
      </form>
    </div>`;
};
