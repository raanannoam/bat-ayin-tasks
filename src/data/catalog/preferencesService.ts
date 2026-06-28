import { safeObjectStorage, writeStorageJson } from "../shared/browserStorage.js";

export type AppPreferences = {
  dark: boolean;
  text: string;
};

export const PREFS_STORAGE_KEY = "beit-prefs";

export const DEFAULT_PREFS: AppPreferences = {
  dark: false,
  text: "רגיל"
};

/** טוען העדפות משתמש מ-localStorage */
export function loadPreferences(): AppPreferences {
  return safeObjectStorage(PREFS_STORAGE_KEY, DEFAULT_PREFS);
}

export function savePreferences(prefs: AppPreferences): void {
  writeStorageJson(PREFS_STORAGE_KEY, prefs);
}
