/** תווית עדיפות משימה */
export function priorityLabel(priority: string | undefined): string {
  return priority === "high" ? "גבוהה" : "רגילה";
}
