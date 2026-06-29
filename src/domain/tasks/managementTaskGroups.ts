import type { AppTask } from "../../data/types/appTask.js";
import { priorityLabel } from "../shared/priorityLabel.js";
import { buildTaskDueLabel, taskDueRank } from "./taskDue.js";

export type ManagementPriorityGroup = {
  priority: "high" | "normal";
  title: string;
  tasks: AppTask[];
};

export type ManagementAssigneeGroup = {
  assignee: string;
  title: string;
  priorityGroups: ManagementPriorityGroup[];
};

/** חותמת יצירה למיון כרונולוגי */
function taskCreatedAtMs(task: AppTask): number {
  const raw = task.created_at;
  if (!raw) return 0;
  const ms = Date.parse(raw);
  return Number.isFinite(ms) ? ms : 0;
}

/** מיון כרונולוגי — מהחדש לישן */
function sortTasksChronologicalNewestFirst(tasks: AppTask[]): AppTask[] {
  return [...tasks].sort(
    (a, b) =>
      taskCreatedAtMs(b) - taskCreatedAtMs(a) ||
      String(b.id ?? "").localeCompare(String(a.id ?? "")) ||
      (a.title ?? "").localeCompare(b.title ?? "", "he")
  );
}

/** קיבוץ לתצוגת ניהול לפי תאריך: עדיפות → כרונולוגי */
export function buildManagementPriorityChronologicalGroups(
  tasks: AppTask[]
): ManagementPriorityGroup[] {
  const groups: ManagementPriorityGroup[] = [];
  const highTasks = sortTasksChronologicalNewestFirst(
    tasks.filter((task) => task.priority === "high")
  );
  const normalTasks = sortTasksChronologicalNewestFirst(
    tasks.filter((task) => task.priority !== "high")
  );

  if (highTasks.length) {
    groups.push({ priority: "high", title: "עדיפות גבוהה", tasks: highTasks });
  }
  if (normalTasks.length) {
    groups.push({ priority: "normal", title: "עדיפות נמוכה", tasks: normalTasks });
  }

  return groups;
}

/** מיון פנימי בתוך קבוצת עדיפות — יעד, איחור, כותרת */
function sortTasksByDueDate(tasks: AppTask[]): AppTask[] {
  return [...tasks].sort(
    (a, b) =>
      taskDueRank(a) - taskDueRank(b) ||
      buildTaskDueLabel(a).localeCompare(buildTaskDueLabel(b), "he") ||
      (a.title ?? "").localeCompare(b.title ?? "", "he")
  );
}

/** קיבוץ לתצוגת ניהול: מבצע → עדיפות */
export function buildManagementAssigneePriorityGroups(
  tasks: AppTask[],
  assigneeOrder: string[] = []
): ManagementAssigneeGroup[] {
  const byAssignee = new Map<string, AppTask[]>();

  for (const task of tasks) {
    const assignee = task.owner?.trim() || "ללא שיוך";
    const bucket = byAssignee.get(assignee);
    if (bucket) bucket.push(task);
    else byAssignee.set(assignee, [task]);
  }

  const orderedAssignees = [
    ...assigneeOrder.filter((name) => byAssignee.has(name)),
    ...[...byAssignee.keys()]
      .filter((name) => !assigneeOrder.includes(name))
      .sort((a, b) => a.localeCompare(b, "he"))
  ];

  return orderedAssignees
    .map((assignee) => {
      const assigneeTasks = byAssignee.get(assignee) || [];
      const highTasks = sortTasksByDueDate(assigneeTasks.filter((task) => task.priority === "high"));
      const normalTasks = sortTasksByDueDate(
        assigneeTasks.filter((task) => task.priority !== "high")
      );
      const priorityGroups: ManagementPriorityGroup[] = [];

      if (highTasks.length) {
        priorityGroups.push({
          priority: "high",
          title: `עדיפות ${priorityLabel("high")}`,
          tasks: highTasks
        });
      }
      if (normalTasks.length) {
        priorityGroups.push({
          priority: "normal",
          title: `עדיפות ${priorityLabel("normal")}`,
          tasks: normalTasks
        });
      }

      return { assignee, title: assignee, priorityGroups };
    })
    .filter((group) => group.priorityGroups.length > 0);
}
