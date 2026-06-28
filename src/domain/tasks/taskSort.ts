import type { AppTask } from "../../data/types/appTask.js";
import type { CategoryItem } from "../../data/catalog/baseCategories.js";
import { resolveCategory } from "../shared/resolveCategory.js";
import { buildTaskDueLabel, taskDueRank } from "./taskDue.js";

export type SortContext = "personal" | "org" | "category" | "person";
export type SortMode = "date" | "category" | "owner";

/** אפשרויות מיון לפי הקשר מסך */
export function sortOptions(context: SortContext = "personal"): [SortMode, string][] {
  if (context === "org") return [["date", "לפי תאריך"], ["category", "לפי קטגוריה"], ["owner", "לפי מבצע"]];
  if (context === "category") return [["date", "לפי תאריך"], ["owner", "לפי מבצע"]];
  if (context === "person") return [["date", "לפי תאריך"], ["category", "לפי קטגוריה"]];
  return [["date", "לפי תאריך"], ["category", "לפי קטגוריה"]];
}

/** מיון פעיל — fallback ל-date */
export function resolveCurrentSort(allSort: string, context: SortContext = "personal"): string {
  const allowed = sortOptions(context).map(([key]) => key);
  return (allowed as string[]).includes(allSort) ? allSort : "date";
}

/** כותרת קבוצה במיון לפי קטגוריה/מבצע */
export function taskGroupTitle(
  task: AppTask,
  sortMode: string,
  categories: CategoryItem[]
): string {
  if (sortMode === "category") return resolveCategory(categories, task.category).label;
  if (sortMode === "owner") return task.owner ?? "";
  return "";
}

/** מיון משימות — עדיפות, יעד, כותרת */
export function sortTasks(
  tasks: AppTask[],
  sortMode: string,
  categories: CategoryItem[]
): AppTask[] {
  return [...tasks].sort((a, b) => {
    const priorityDiff = (a.priority === "high" ? 0 : 1) - (b.priority === "high" ? 0 : 1);
    if (priorityDiff) return priorityDiff;
    if (sortMode === "category") {
      return (
        resolveCategory(categories, a.category).label.localeCompare(
          resolveCategory(categories, b.category).label,
          "he"
        ) ||
        taskDueRank(a) - taskDueRank(b) ||
        buildTaskDueLabel(a).localeCompare(buildTaskDueLabel(b), "he") ||
        (a.title ?? "").localeCompare(b.title ?? "", "he")
      );
    }
    if (sortMode === "owner") {
      return (
        (a.owner ?? "").localeCompare(b.owner ?? "", "he") ||
        taskDueRank(a) - taskDueRank(b) ||
        buildTaskDueLabel(a).localeCompare(buildTaskDueLabel(b), "he") ||
        (a.title ?? "").localeCompare(b.title ?? "", "he")
      );
    }
    return (
      taskDueRank(a) - taskDueRank(b) ||
      buildTaskDueLabel(a).localeCompare(buildTaskDueLabel(b), "he") ||
      (a.title ?? "").localeCompare(b.title ?? "", "he")
    );
  });
}
