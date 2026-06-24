type TaskUpdateRow = { task_id: string };

/** מקבץ עדכונים לפי task_id */
export function groupTaskUpdatesByTaskId<T extends TaskUpdateRow>(
  rows: T[] | null | undefined
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  (rows || []).forEach((row) => {
    const list = grouped.get(row.task_id) || [];
    list.push(row);
    grouped.set(row.task_id, list);
  });
  return grouped;
}
