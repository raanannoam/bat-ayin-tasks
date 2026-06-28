import { dateFromIso } from "../../data/shared/dateUtils.js";

/** תאריך בעברית — ללא יעד אם חסר */
export function formatHebrewDate(value: string | null | undefined): string {
  if (!value) return "ללא יעד";
  const date = dateFromIso(value);
  if (!date) return "ללא יעד";
  const days = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
  const months = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
  return `${days[date.getDay()]} · ${date.getDate()} ${months[date.getMonth()]}`;
}
