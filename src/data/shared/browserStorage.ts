/** גישה בטוחה ל-localStorage — מונע קריסה על JSON פגום */

export function safeParseStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

export function safeArrayStorage(key: string): unknown[] {
  const value = safeParseStorage(key, []);
  return Array.isArray(value) ? value : [];
}

export function safeObjectStorage<T extends Record<string, unknown>>(key: string, fallback: T): T {
  const value = safeParseStorage(key, fallback);
  return value && typeof value === "object" && !Array.isArray(value) ? value : fallback;
}

export function writeStorageJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    const name = error instanceof DOMException ? error.name : "";
    if (name === "QuotaExceededError") {
      throw new Error("STORAGE_QUOTA_EXCEEDED");
    }
    throw error;
  }
}
