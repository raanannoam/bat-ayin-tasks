import { isoDateFromOffset } from "../../shared/dateUtils.js";

/** נתוני seed לספקים — localStorage בלבד */
export const STARTER_SUPPLIERS = [
  {
    id: "s1",
    supplier: "ספק ירקות",
    description: "הזמנת ירקות לשבת",
    amount: "₪680",
    due_date: isoDateFromOffset(1),
    notes: "לוודא כמויות מול המטבח לפני תשלום.",
    document_notes: "חשבונית תתווסף אחרי קבלת הסחורה.",
    links: ["https://example.com/order-vegetables"],
    assignees: ["עדינה"],
    allAssignees: false,
    steps: { order: true, received: false, payment: false, invoice: false },
    step_dates: { order: isoDateFromOffset(0), received: "", payment: "", invoice: "" },
    created_at: isoDateFromOffset(0)
  },
  {
    id: "s2",
    supplier: "ציוד תחזוקה",
    description: "רכישת כבלים וציוד לאולם",
    amount: "",
    due_date: "",
    notes: "מיועד לכל צוות הניהול.",
    document_notes: "צילום מסך הצעת מחיר נשמר בינתיים בהערות.",
    links: [],
    assignees: [],
    allAssignees: true,
    steps: { order: true, received: true, payment: false, invoice: false },
    step_dates: { order: isoDateFromOffset(-1), received: isoDateFromOffset(0), payment: "", invoice: "" },
    created_at: isoDateFromOffset(-1)
  }
];
