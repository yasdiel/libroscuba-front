/**
 * Cache en memoria con TTL, deduplicación de peticiones en vuelo y
 * suscripción a cambios (para stale-while-revalidate).
 *
 * - Vive solo en memoria: al recargar la página queda limpio.
 * - Cualquier mutación puede invalidar entradas por clave o por prefijo.
 */

interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
  ttl: number
}

const store = new Map<string, CacheEntry>()
const inflight = new Map<string, Promise<unknown>>()
const subscribers = new Map<string, Set<() => void>>()

export function cacheGet<T>(key: string): CacheEntry<T> | null {
  return (store.get(key) as CacheEntry<T> | undefined) ?? null
}

export function cacheSet<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, { data, timestamp: Date.now(), ttl: ttlMs })
  notify(key)
}

export function cacheIsFresh(entry: CacheEntry | null): boolean {
  if (!entry) return false
  return Date.now() - entry.timestamp < entry.ttl
}

export function cacheInvalidate(key: string): void {
  if (store.delete(key)) notify(key)
}

export function cacheInvalidatePrefix(prefix: string): void {
  const keys: string[] = []
  for (const k of store.keys()) {
    if (k.startsWith(prefix)) keys.push(k)
  }
  for (const k of keys) {
    store.delete(k)
    notify(k)
  }
}

export function cacheClear(): void {
  const keys = Array.from(store.keys())
  store.clear()
  for (const k of keys) notify(k)
}

/**
 * Garantiza que una misma `key` no dispare dos peticiones simultáneas:
 * si ya hay una en vuelo, devuelve la misma promesa.
 */
export function cacheInflight<T>(
  key: string,
  factory: () => Promise<T>
): Promise<T> {
  const existing = inflight.get(key) as Promise<T> | undefined
  if (existing) return existing
  const promise = factory().finally(() => inflight.delete(key))
  inflight.set(key, promise)
  return promise
}

export function cacheSubscribe(key: string, cb: () => void): () => void {
  let set = subscribers.get(key)
  if (!set) {
    set = new Set()
    subscribers.set(key, set)
  }
  set.add(cb)
  return () => {
    const s = subscribers.get(key)
    if (!s) return
    s.delete(cb)
    if (s.size === 0) subscribers.delete(key)
  }
}

function notify(key: string): void {
  const subs = subscribers.get(key)
  if (!subs) return
  for (const cb of subs) cb()
}
