import type { CategoryItem } from "../../data/catalog/baseCategories.js";

const FALLBACK_CATEGORY: CategoryItem = {
  id: "uncategorized",
  label: "ללא קטגוריה",
  icon: "office"
};

/** מחזיר קטגוריה לפי id — fallback אם לא נמצא */
export function resolveCategory(categories: CategoryItem[], id: string | undefined): CategoryItem {
  return categories.find((c) => c.id === id) ?? FALLBACK_CATEGORY;
}
