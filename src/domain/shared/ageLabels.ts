import { daysBetween } from "../../data/shared/dateUtils.js";

/** תווית גיל משימה — "נוצרה לפני X" */
export function ageLabel(createdAt: string | null | undefined): string {
  const days = daysBetween(createdAt);
  return days === 1 ? "נוצרה לפני יום" : `נוצרה לפני ${days} ימים`;
}

/** תווית גיל יחסית — "לפני X" / "היום" */
export function relativeAgeLabel(createdAt: string | null | undefined): string {
  const days = daysBetween(createdAt);
  if (days === 0) return "היום";
  return days === 1 ? "לפני יום" : `לפני ${days} ימים`;
}
