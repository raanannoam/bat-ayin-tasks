/** עוטף adapter סינכרוני ב-facade א-סינכרוני — parity tasksRepository / suppliersRepository */
export function createAsyncRepository<T extends Record<string, unknown>>(
  adapter: T,
  methods: (keyof T & string)[]
): Record<string, (...args: unknown[]) => Promise<unknown>> {
  const repository: Record<string, (...args: unknown[]) => Promise<unknown>> = {};
  for (const method of methods) {
    const fn = adapter[method];
    if (typeof fn !== "function") continue;
    repository[method] = (...args: unknown[]) =>
      Promise.resolve((fn as (...a: unknown[]) => unknown).apply(adapter, args));
  }
  return repository;
}
