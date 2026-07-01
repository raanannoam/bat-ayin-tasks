/** נתוני התחלה — משקפים את ייצור V1 */
const SEED = {
  categories: [
    { id: "kitchen", label: "מטבח", icon: "kitchen" },
    { id: "maintenance", label: "תחזוקה", icon: "maintenance" },
    { id: "study", label: "לימוד", icon: "study" },
    { id: "money", label: "כספים", icon: "money" },
    { id: "events", label: "אירועים", icon: "events" },
    { id: "office", label: "משרד", icon: "office" }
  ],
  people: ["עדינה", "אבי", "חיה", "צבי"],
  stepLabels: [
    { key: "order", label: "הזמנה", color: "blue" },
    { key: "received", label: "קבלה", color: "sand" },
    { key: "payment", label: "תשלום", color: "warning" },
    { key: "invoice", label: "חשבונית", color: "success" }
  ],
  tasks: [
    { id: "t1", title: "אישור הזמנת ירקות", category: "kitchen", owner: "עדינה", assigneeId: "u1", due: "today", dueLabel: "היום", status: "progress", priority: "normal", notes: "לבדוק מול הספק", updates: [{ id: "u1", by: "עדינה", text: "מחכה למחיר סופי", created_at: "2026-06-29" }] },
    { id: "t2", title: "בדיקת ציוד לשבת", category: "maintenance", owner: "אבי", assigneeId: "u2", due: "today", dueLabel: "היום", status: "progress", priority: "high", notes: "שולחנות וכבלים", updates: [] },
    { id: "t3", title: "הכנת דף מקורות", category: "study", owner: "עדינה", assigneeId: "u1", due: "tomorrow", dueLabel: "מחר", status: "progress", priority: "normal", notes: "20 עותקים", updates: [] },
    { id: "t4", title: "סידור רשימת קניות", category: "office", owner: "עדינה", assigneeId: "u1", due: "today", dueLabel: "היום", status: "progress", priority: "normal", notes: "", updates: [] },
    { id: "t5", title: "אישור תשלום לספק", category: "money", owner: "צבי", assigneeId: "u4", due: "today", dueLabel: "היום", status: "progress", priority: "high", notes: "לוודא חשבונית", updates: [] },
    { id: "t6", title: "בדיקת מלאי", category: "kitchen", owner: "חיה", assigneeId: "u3", due: "tomorrow", dueLabel: "מחר", status: "progress", priority: "normal", notes: "שמן, קמח", updates: [] },
    { id: "t7", title: "תשלום לספק", category: "money", owner: "עדינה", assigneeId: "u1", due: "none", dueLabel: "הושלם", status: "done", priority: "normal", notes: "נסגר", completed_at: "2026-06-27", updates: [] },
    { id: "t8", title: "דף מקורות לשיעור", category: "study", owner: "עדינה", assigneeId: "u1", due: "none", dueLabel: "הושלם", status: "done", priority: "normal", notes: "", completed_at: "2026-06-25", updates: [] },
    { id: "t9", title: "הזמנת ציוד", category: "maintenance", owner: "צבי", assigneeId: "u4", due: "none", dueLabel: "הושלם", status: "done", priority: "normal", notes: "", completed_at: "2026-06-20", updates: [] },
    { id: "t10", title: "ארכיון ישן", category: "office", owner: "עדינה", assigneeId: "u1", due: "none", dueLabel: "הושלם", status: "done", priority: "normal", notes: "", completed_at: "2026-01-15", updates: [] }
  ],
  suppliers: [
    { id: "s1", supplier: "ספק ירקות", description: "הזמנת ירקות לשבת", amount: "₪680", due_date: "2026-06-30", assignees: ["עדינה"], allAssignees: false, notes: "לוודא כמויות", document_notes: "", links: [], steps: { order: true, received: false, payment: false, invoice: false }, step_dates: { order: "2026-06-29", received: "", payment: "", invoice: "" } },
    { id: "s2", supplier: "ציוד תחזוקה", description: "כבלים וציוד", amount: "₪420", due_date: "2026-07-02", assignees: ["אבי", "צבי"], allAssignees: false, notes: "לכל הצוות", document_notes: "חשבונית בדרך", links: ["https://example.com/quote"], steps: { order: true, received: true, payment: false, invoice: false }, step_dates: { order: "2026-06-28", received: "2026-06-29", payment: "", invoice: "" } },
    { id: "s3", supplier: "דפוס העמק", description: "הדפסת חומרי לימוד", amount: "₪1,200", due_date: "2026-06-25", assignees: ["עדינה"], allAssignees: false, notes: "הושלם", document_notes: "", links: [], steps: { order: true, received: true, payment: true, invoice: true }, step_dates: { order: "2026-06-20", received: "2026-06-22", payment: "2026-06-25", invoice: "2026-06-26" } },
    { id: "s4", supplier: "ספק ישן", description: "הזמנה ישנה", amount: "₪350", due_date: "2026-01-10", assignees: ["עדינה"], allAssignees: false, notes: "", document_notes: "", links: [], steps: { order: true, received: true, payment: true, invoice: true }, step_dates: { order: "2026-01-05", received: "2026-01-07", payment: "2026-01-08", invoice: "2026-01-10" } }
  ],
  members: [
    { userId: "u1", displayName: "עדינה", email: "adina@example.com", role: "manager", isActive: true },
    { userId: "u2", displayName: "אבי", email: "avi@example.com", role: "user", isActive: true },
    { userId: "u3", displayName: "חיה", email: "haya@example.com", role: "user", isActive: true },
    { userId: "u4", displayName: "צבי", email: "tzvi@example.com", role: "user", isActive: true },
    { userId: "u5", displayName: "דוד", email: "david@example.com", role: "user", isActive: false }
  ]
};
