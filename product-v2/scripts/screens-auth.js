/** מסכי אימות — דמו לכל מצבי V1 */
var AuthScreens = {};

AuthScreens.login = () => `
  <div class="screen screen--gate">
    <div class="auth-card">
      <h1>משימות ישיבת בת עין</h1>
      <p class="muted small">Product V2 — אב-טיפוס אינטראקטיבי</p>
      <button class="btn btn--primary btn--block" type="button" data-action="sign-in">${icon("login")} כניסה עם Google (דמו)</button>
      <p class="muted small">בדמו: לחיצה נכנסת ישירות. בייצור: OAuth אמיתי.</p>
    </div>
  </div>`;

AuthScreens.gate = (type) => {
  const gates = {
    "no-access": ["אין גישה", "החשבון לא משויך לארגון ישיבת בת עין.", "sign-out"],
    "missing-profile": ["פרופיל חסר", "לא נמצא פרופיל משתמש. פנה למנהל.", "sign-out"],
    error: ["שגיאת התחברות", "משהו השתבש. נסה שוב.", "retry-login"]
  };
  const [title, msg, action] = gates[type] || gates.error;
  const btn = action === "retry-login"
    ? `<button class="btn btn--primary btn--block" type="button" data-route="login">נסה שוב</button>`
    : `<button class="btn btn--ghost btn--block" type="button" data-action="sign-out">יציאה</button>`;
  return gateScreen(title, msg, btn);
};
