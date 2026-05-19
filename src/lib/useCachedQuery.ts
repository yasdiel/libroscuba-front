import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react"

import {
  cacheGet,
  cacheInflight,
  cacheIsFresh,
  cacheSet,
  cacheSubscribe,
} from "@/lib/cache"

interface UseCachedQueryOptions<T> {
  /** Clave única de la query. Si es `null`, la query se desactiva. */
  key: string | null
  /** Función que pide los datos al backend. */
  fetcher: () => Promise<T>
  /** Tiempo en ms en que la cache se considera "fresca" (no se hace background fetch). */
  ttlMs?: number
  /** Si es `false`, la query no se ejecuta. */
  enabled?: boolean
}

export interface UseCachedQueryResult<T> {
  /** Datos disponibles (del cache o de la última respuesta). `null` mientras no haya nada. */
  data: T | null
  /** `true` cuando se está cargando Y todavía no hay datos en cache. */
  loading: boolean
  /** `true` siempre que haya una petición en vuelo (incluido revalidate). */
  isFetching: boolean
  /** Último error de fetch, si lo hubo. */
  error: Error | null
  /** Forzar refetch (ignora el TTL y refresca cache). */
  refetch: () => Promise<void>
}

const EMPTY_SUBSCRIBE = () => () => {}

/**
 * Hook con estrategia stale-while-revalidate:
 *
 * 1. Si hay cache para la `key`, se devuelve al instante (`data`).
 * 2. Si esa cache está vencida (>= ttlMs), se dispara un fetch en background
 *    cuyo resultado se mete en la cache; el `data` se actualiza solo.
 * 3. Si no hay cache, se hace un fetch normal (`loading = true`).
 * 4. Cambia la `key` → repetimos el paso 1 con la nueva.
 *
 * Cualquier llamada simultánea a la misma `key` se deduplica (cacheInflight).
 */
export function useCachedQuery<T>({
  key,
  fetcher,
  ttlMs = 60_000,
  enabled = true,
}: UseCachedQueryOptions<T>): UseCachedQueryResult<T> {
  const subscribe = useCallback(
    (cb: () => void) => (key ? cacheSubscribe(key, cb) : EMPTY_SUBSCRIBE()),
    [key]
  )
  const getSnapshot = useCallback(
    () => (key ? cacheGet<T>(key)?.data ?? null : null),
    [key]
  )
  const cachedData = useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const fetcherRef = useRef(fetcher)
  fetcherRef.current = fetcher

  const doFetch = useCallback(async () => {
    if (!key) return
    setIsFetching(true)
    setError(null)
    try {
      const data = await cacheInflight(key, () => fetcherRef.current())
      cacheSet(key, data, ttlMs)
    } catch (e) {
      setError(e instanceof Error ? e : new Error("Error al cargar datos"))
    } finally {
      setIsFetching(false)
    }
  }, [key, ttlMs])

  useEffect(() => {
    if (!enabled || !key) return
    const entry = cacheGet(key)
    if (cacheIsFresh(entry)) return
    doFetch()
  }, [enabled, key, doFetch])

  const loading = enabled && key !== null && cachedData === null && isFetching

  return {
    data: cachedData,
    loading,
    isFetching,
    error,
    refetch: doFetch,
  }
}
