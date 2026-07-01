/** מסך העדפות — הגדרות, דמו, מצבי שגיאה */
var SettingsScreens = {};

SettingsScreens.main = () => {
  const u = Store.currentUser();
  return `
    <div class="screen">
      ${backBar("חזרה", Store.lastList || "today")}
      <div class="screen-section">
        <h1>העדפות</h1>
        <p class="muted small">${esc(u.name)} · ${u.role === "manager" ? "מנהל" : "משתמש"}</p>
      </div>

      <div class="detail-block">
        <span class="detail-block__label">מצב תצוגה</span>
        <button class="btn btn--ghost btn--block" type="button" data-theme-toggle>${icon("moon")} מצב כהה / בהיר</button>
      </div>

      <div class="detail-block">
        <span class="detail-block__label">גודל טקסט</span>
        <div class="segmented" id="textSizeSeg">
          <button type="button" class="${Store.prefs.text === "קטן" ? "is-active" : ""}" data-text="קטן">קטן</button>
          <button type="button" class="${Store.prefs.text === "רגיל" ? "is-active" : ""}" data-text="רגיל">רגיל</button>
          <button type="button" class="${Store.prefs.text === "גדול" ? "is-active" : ""}" data-text="גדול">גדול</button>
        </div>
      </div>

      <div class="screen-section">
        <span class="section-label">דמו — החלפת תפקיד</span>
        <div class="chip-row">
          <button class="chip ${u.role === "user" ? "is-active" : ""}" type="button" data-action="switch-role" data-role="user">משתמש</button>
          <button class="chip ${u.role === "manager" ? "is-active" : ""}" type="button" data-action="switch-role" data-role="manager">מנהל</button>
        </div>
      </div>

      ${Store.isManager() ? `<div class="detail-block">
        <span class="detail-block__label">ניהול נתונים (דמו)</span>
        <button class="btn btn--danger btn--block" type="button" data-action="clear-tasks-step1">מחיקת כל המשימות</button>
        <div id="clearConfirm"></div>
      </div>` : ""}

      <div class="screen-section">
        <span class="section-label">מצבי מערכת (לבדיקה)</span>
        ${moduleCard("demo/empty", "inbox", "מצב ריק", "דוגמת empty state")}
        ${moduleCard("demo/loading", "clock", "מצב טעינה", "דוגמת skeleton")}
        ${moduleCard("gate/no-access", "alert", "שער — אין גישה", "מסך gate")}
        ${moduleCard("gate/missing-profile", "alert", "שער — פרופיל חסר", "מסך gate")}
      </div>

      <button class="btn btn--ghost btn--block" type="button" data-action="sign-out">יציאה</button>
    </div>`;
};
