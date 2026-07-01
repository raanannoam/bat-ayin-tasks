/** רender משותף — שורות, ריק, טעינה, כרטיסים */
function taskRow(task, opts = {}) {
  const done = task.status === "done";
  const showOwner = opts.showOwner !== false && Store.isManager();
  const canComplete = !done && Store.canAccessTask(task);
  const badge = task.dueLabel === "היום" ? '<span class="badge badge--today">היום</span>' : "";
  const urgent = task.priority === "high" && !done ? '<span class="badge badge--overdue">דחוף</span>' : "";
  return `
    <div class="task-row-wrap">
      <button class="task-row" type="button" data-route="task/${task.id}">
        <span class="task-row__body">
          <span class="task-row__title">${esc(task.title)}</span>
          <span class="task-row__meta">
            ${categoryIcon(task.category)} ${esc(Store.catLabel(task.category))}
            ${showOwner ? `<span class="dot">·</span> ${esc(task.owner)}` : ""}
            ${badge}${urgent}
          </span>
        </span>
      </button>
      ${canComplete ? `<button class="check-circle" type="button" data-action="complete" data-id="${task.id}" aria-label="סמן כהושלם"></button>` : `<span class="check-circle ${done ? "is-done" : ""}">${done ? icon("done") : ""}</span>`}
    </div>`;
}

function taskList(tasks, emptyMsg, ctaRoute) {
  if (!tasks.length) return emptyState("inbox", emptyMsg, ctaRoute);
  return `<div class="task-list">${tasks.map((t) => taskRow(t)).join("")}</div>`;
}

function emptyState(iconName, title, ctaRoute) {
  return `
    <div class="empty-state">
      <div class="empty-state__icon">${icon(iconName)}</div>
      <div><h2>${esc(title)}</h2><p class="muted small">הכל מסודר — אפשר לנשום.</p></div>
      ${ctaRoute ? `<button class="btn btn--primary" type="button" data-route="${ctaRoute}">${icon("add")} משימה חדשה</button>` : ""}
    </div>`;
}

function loadingState(msg = "טוען...") {
  return `<div class="loading-state"><div class="loading-spinner"></div><p class="muted">${esc(msg)}</p>
    <div class="skeleton skeleton-row"></div><div class="skeleton skeleton-row"></div></div>`;
}

function backBar(label, route) {
  return `<button class="back-link" type="button" data-route="${route}">${icon("back")} ${esc(label)}</button>`;
}

function statCards(items, clickable) {
  return `<div class="stat-grid">${items.map(([n, l, r]) => {
    const inner = `<strong>${n}</strong><span>${esc(l)}</span>`;
    return r ? `<button class="stat-card stat-card--link" type="button" data-route="${r}">${inner}</button>` : `<div class="stat-card">${inner}</div>`;
  }).join("")}</div>`;
}

function sortChips(active, baseRoute) {
  const opts = [["date", "תאריך"], ["category", "קטגוריה"], ["priority", "עדיפות"]];
  return `<div class="chip-row">${opts.map(([k, l]) =>
    `<button class="chip ${active === k ? "is-active" : ""}" type="button" data-sort="${k}" data-sort-base="${baseRoute}">${esc(l)}</button>`
  ).join("")}</div>`;
}

function moduleCard(route, iconName, title, desc) {
  return `<button class="module-card" type="button" data-route="${route}">
    <span class="module-card__icon">${icon(iconName)}</span>
    <span><strong>${esc(title)}</strong><p>${esc(desc)}</p></span>${icon("back")}</button>`;
}

function gateScreen(title, msg, actions) {
  return `<div class="screen screen--gate">
    <div class="empty-state"><div class="empty-state__icon">${icon("alert")}</div>
    <div><h1>${esc(title)}</h1><p class="muted">${esc(msg)}</p></div>
    ${actions}</div></div>`;
}

function inlineConfirm(id, msg, confirmAction, confirmLabel = "אישור") {
  return `<div class="inline-confirm" id="${id}">
    <p class="small">${esc(msg)}</p>
    <div class="chip-row">
      <button class="btn btn--ghost" type="button" data-action="cancel-inline" data-target="${id}">ביטול</button>
      <button class="btn btn--danger" type="button" data-action="${confirmAction}">${esc(confirmLabel)}</button>
    </div></div>`;
}

/** קבוצת "הושלמו" — משותף למשימות ולספקים */
function doneGroupSection(config) {
  const {
    kind, totalCount, recentCount, archivedCount, isOpen, showArchive,
    recentItems, archivedItems, renderItems, emptyRecentMsg, emptyAllMsg
  } = config;
  if (!totalCount) return "";

  const toggleAction = kind === "tasks" ? "toggle-completed-tasks" : "toggle-completed-suppliers";
  const archiveAction = kind === "tasks" ? "show-task-archive" : "show-supplier-archive";
  const label = kind === "tasks" ? "משימות" : "הזמנות";
  const visible = showArchive ? [...recentItems, ...archivedItems] : recentItems;
  const hint = `<p class="done-hint muted">${recentCount} מהחודש האחרון${archivedCount ? ` · ${archivedCount} ישנות יותר` : ""}</p>`;
  const archiveBtn = isOpen && archivedCount && !showArchive
    ? `<button class="done-archive-btn" type="button" data-action="${archiveAction}">
        <span><strong>הצג ${archivedCount} ${label} ישנות יותר</strong>
        <span class="muted">הושלמו לפני יותר מ-${Store.DONE_RECENT_DAYS} יום</span></span>
        <span class="task-group-chevron">${icon("chevronDown")}</span></button>`
    : "";
  const body = isOpen
    ? `${hint}${renderItems(visible, recentCount ? emptyRecentMsg : emptyAllMsg)}${archiveBtn}`
    : "";

  return `
    <section class="task-group ${isOpen ? "is-open" : ""}">
      <button type="button" class="task-group-toggle" data-action="${toggleAction}" aria-expanded="${isOpen ? "true" : "false"}">
        <h2 class="task-group-title">הושלמו · ${totalCount}</h2>
        <span class="task-group-chevron">${icon("chevronDown")}</span>
      </button>
      ${body}
    </section>`;
}

function supplierRow(s) {
  const pct = Store.supplierProgress(s.steps);
  const current = Store.stepLabels.find((st) => !s.steps[st.key]) || Store.stepLabels[3];
  const open = pct < 100;
  return `
    <div class="supplier-row-wrap">
      <button class="task-row supplier-row" type="button" data-route="supplier/${s.id}">
        <span class="task-row__body">
          <span class="task-row__title">${esc(s.supplier)}</span>
          <span class="task-row__meta">${esc(s.description)} · ${esc(s.amount || "ללא סכום")}</span>
          <span class="task-row__meta">${icon("clock")} ${esc(current.label)} · ${pct}%</span>
        </span>
        <span class="badge ${open ? "badge--today" : "badge--done"}">${pct}%</span>
      </button>
      ${open ? `<div class="supplier-quick">${Store.stepLabels.map((st) =>
    `<button class="step-mini ${s.steps[st.key] ? "is-done" : ""}" type="button" data-action="toggle-step" data-id="${s.id}" data-step="${st.key}" title="${esc(st.label)}">${s.steps[st.key] ? icon("done") : esc(st.label.slice(0, 2))}</button>`
  ).join("")}</div>` : ""}
    </div>`;
}
