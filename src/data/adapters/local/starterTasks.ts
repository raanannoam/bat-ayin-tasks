/** נתוני seed למשימות — localStorage בלבד */
export const DATA_VERSION = "mockup-v3";

export const STARTER_TASKS = [
  { id: "t1", title: "אישור הזמנת ירקות", category: "kitchen", owner: "עדינה", due: "today", dueLabel: "היום · שלישי", status: "progress", notes: "לבדוק מול הספק ולאשר כמויות", updates: [{ by: "עדינה", text: "מחכה למחיר סופי" }] },
  { id: "t2", title: "בדיקת ציוד לשבת", category: "maintenance", owner: "אבי", due: "today", dueLabel: "היום · שלישי", status: "progress", notes: "לוודא שולחנות וכבלים באולם", updates: [{ by: "אבי", text: "חסר כבל מאריך אחד" }] },
  { id: "t3", title: "בדיקת ספק", category: "events", owner: "חיה", due: "date", dueLabel: "שני · 14 יוני", status: "progress", notes: "לקבל אישור על מועד הגעה", updates: [] },
  { id: "t4", title: "הכנת דף מקורות", category: "study", owner: "עדינה", due: "tomorrow", dueLabel: "מחר · רביעי", status: "progress", notes: "להדפיס עשרים עותקים", updates: [] },
  { id: "t11", title: "סידור רשימת קניות", category: "office", owner: "עדינה", due: "today", dueLabel: "היום · שלישי", status: "progress", notes: "לעדכן אחרי שיחה עם המטבח", updates: [] },
  { id: "t12", title: "תיאום הדפסות", category: "study", owner: "עדינה", due: "today", dueLabel: "היום · שלישי", status: "progress", notes: "לבדוק מול המזכירות לפני 13:00", updates: [] },
  { id: "t5", title: "אישור תשלום לספק", category: "money", owner: "צבי", due: "today", dueLabel: "היום · שלישי", status: "progress", notes: "לוודא חשבונית לפני אישור", updates: [] },
  { id: "t6", title: "שיחה עם איש תחזוקה", category: "maintenance", owner: "צבי", due: "today", dueLabel: "היום · שלישי", status: "progress", notes: "לתאם תיקון ידית בדלת", updates: [] },
  { id: "t7", title: "תשלום לספק", category: "money", owner: "עדינה", due: "done", dueLabel: "הושלם · ראשון", status: "done", notes: "נסגר", updates: [{ by: "צבי", text: "אושר במזכירות" }] },
  { id: "t8", title: "דף מקורות לשיעור", category: "study", owner: "עדינה", due: "done", dueLabel: "הושלם · שני", status: "done", notes: "הועבר להדפסה", updates: [] },
  { id: "t9", title: "הזמנת ציוד", category: "maintenance", owner: "צבי", due: "done", dueLabel: "הושלם · שני", status: "done", notes: "בוצע", updates: [] },
  { id: "t10", title: "בדיקת מלאי", category: "kitchen", owner: "חיה", due: "tomorrow", dueLabel: "מחר · רביעי", status: "progress", notes: "לבדוק שמן, קמח ותבלינים", updates: [] }
];
