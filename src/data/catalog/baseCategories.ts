/** קטגוריות בסיס — מוסתרות/מותאמות דרך localStorage */
export type CategoryItem = {
  id: string;
  label: string;
  icon: string;
};

export const BASE_CATEGORIES: CategoryItem[] = [
  { id: "kitchen", label: "מטבח", icon: "kitchen" },
  { id: "maintenance", label: "תחזוקה", icon: "maintenance" },
  { id: "study", label: "לימוד", icon: "study" },
  { id: "money", label: "כספים", icon: "money" },
  { id: "events", label: "אירועים", icon: "events" },
  { id: "office", label: "משרד", icon: "office" }
];

export const HIDDEN_CATEGORIES_KEY = "beit-hidden-categories";
export const CUSTOM_CATEGORIES_KEY = "beit-categories";
