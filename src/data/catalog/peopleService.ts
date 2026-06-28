import { safeArrayStorage, writeStorageJson } from "../shared/browserStorage.js";
import { BASE_PEOPLE, CUSTOM_PEOPLE_KEY, HIDDEN_PEOPLE_KEY } from "./basePeople.js";

/** טוען מבצעים מ-visible base + custom, פחות hidden */
export function loadPeople(): string[] {
  const hidden = safeArrayStorage(HIDDEN_PEOPLE_KEY) as string[];
  const custom = safeArrayStorage(CUSTOM_PEOPLE_KEY) as string[];
  return [...BASE_PEOPLE.filter((p) => !hidden.includes(p)), ...custom];
}

export function readHiddenPeople(): string[] {
  return safeArrayStorage(HIDDEN_PEOPLE_KEY) as string[];
}

export function readCustomPeople(): string[] {
  return safeArrayStorage(CUSTOM_PEOPLE_KEY) as string[];
}

export function saveHiddenPeople(names: string[]): void {
  writeStorageJson(HIDDEN_PEOPLE_KEY, names);
}

export function saveCustomPeople(names: string[]): void {
  writeStorageJson(CUSTOM_PEOPLE_KEY, names);
}

export function allKnownPeople(): string[] {
  return [...BASE_PEOPLE, ...readCustomPeople()];
}
