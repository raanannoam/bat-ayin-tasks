import { safeArrayStorage, writeStorageJson } from "../shared/browserStorage.js";
import {
  BASE_CATEGORIES,
  CUSTOM_CATEGORIES_KEY,
  HIDDEN_CATEGORIES_KEY,
  type CategoryItem
} from "./baseCategories.js";

/** טוען קטגוריות מ-visible base + custom, פחות hidden */
export function loadCategories(): CategoryItem[] {
  const hidden = safeArrayStorage(HIDDEN_CATEGORIES_KEY) as string[];
  const custom = safeArrayStorage(CUSTOM_CATEGORIES_KEY) as CategoryItem[];
  return [...BASE_CATEGORIES.filter((c) => !hidden.includes(c.id)), ...custom];
}

export function readHiddenCategoryIds(): string[] {
  return safeArrayStorage(HIDDEN_CATEGORIES_KEY) as string[];
}

export function readCustomCategories(): CategoryItem[] {
  return safeArrayStorage(CUSTOM_CATEGORIES_KEY) as CategoryItem[];
}

export function saveHiddenCategoryIds(ids: string[]): void {
  writeStorageJson(HIDDEN_CATEGORIES_KEY, ids);
}

export function saveCustomCategories(categories: CategoryItem[]): void {
  writeStorageJson(CUSTOM_CATEGORIES_KEY, categories);
}
