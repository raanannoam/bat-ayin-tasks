/** מסך היום — נקודת כניסה ראשית */
var TodayScreens = {};

TodayScreens.main = () => {
  const mine = Store.openTasks(false);
  const today = Store.todayTasks(false);
  const suppliers = Store.visibleSuppliers().filter((s) => Store.supplierProgress(s.steps) < 100);
  const urgent = mine.filter((t) => t.priority === "high");

  return `
    <div class="screen">
      <div class="screen-section">
        <h1>היום</h1>
        <p class="muted small">${new Date().toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" })}</p>
        ${statCards([
          [today.length, "משימות להיום", "tasks"],
          [suppliers.length, "הזמנות פתוחות", "suppliers"],
          [urgent.length, "דחופות", "tasks/priority"],
          [Store.doneTasks(false).length, "הושלמו", "done"]
        ], true)}
      </div>

      <div class="screen-section">
        <span class="section-label">משימות להיום · ${today.length}</span>
        ${taskList(today.slice(0, 5), "יום נקי — אין משימות להיום", "task/create")}
        ${today.length > 5 ? `<button class="btn btn--ghost btn--block" type="button" data-route="tasks">כל המשימות (${mine.length})</button>` : ""}
      </div>

      ${suppliers.length ? `<div class="screen-section">
        <span class="section-label">רכש — דורש טיפול · ${suppliers.length}</span>
        <div class="task-list">${suppliers.slice(0, 3).map((s) => supplierRow(s)).join("")}</div>
        <button class="btn btn--ghost btn--block" type="button" data-route="suppliers">כל ההזמנות</button>
      </div>` : ""}

      ${Store.isManager() ? `<div class="screen-section">
        ${moduleCard("manage", "manager", "מרכז ניהול", "משימות ארגון, ספקים וחברי צוות")}
      </div>` : ""}
    </div>`;
};
