/** תאריך היום בחצות */
export function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

/** YYYY-MM-DD לפי offset ימים מהיום */
export function isoDateFromOffset(days: number) {
  const date = startOfToday();
  date.setDate(date.getDate() + days);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

/** מפרס ISO date string ל-Date */
export function dateFromIso(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** חותך/מאמת YYYY-MM-DD */
export function toIsoDateOnly(value: unknown): string | null {
  if (!value || typeof value !== "string") return null;
  const dateOnly = value.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(dateOnly) ? dateOnly : null;
}

/** ממיר due_date ל-bucket: today | tomorrow | date | none | done */
export function getDateBucketFromIso(dueDate: unknown, status: string | null | undefined) {
  if (status === "done") return "done";
  const dueOnly = toIsoDateOnly(dueDate);
  if (!dueOnly) return "none";
  if (dueOnly === isoDateFromOffset(0)) return "today";
  if (dueOnly === isoDateFromOffset(1)) return "tomorrow";
  return "date";
}
