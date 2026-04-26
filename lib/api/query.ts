/**
 * Factory that creates a React Query `queryFn` for a given API path.
 * Throws on non-OK responses so React Query treats them as errors.
 *
 * Usage:
 *   queryFn: createQueryFn('/api/instances')
 *   queryFn: () => createQueryFn(`/api/instances/${id}`)()
 */
export function createQueryFn<T>(path: string): () => Promise<T> {
  return async () => {
    const res = await fetch(path);
    if (!res.ok) throw new Error(`Failed to fetch ${path}`);
    return res.json() as Promise<T>;
  };
}
