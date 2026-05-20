import { api, cacheKeys } from "@/lib/api"
import { cacheGet, cacheInflight, cacheIsFresh, cacheSet } from "@/lib/cache"
import { CATALOG_PAGE_SIZE, defaultCatalogParams } from "@/lib/catalog"
import { env } from "@/lib/env"

const CATALOG_TTL_MS = 60_000

let started = false

/**
 * En cuanto arranca la app:
 * 1. preconnect al API (menos latencia en la primera petición)
 * 2. /api/health para despertar el servidor (Render free tier)
 * 3. precarga el catálogo en cache antes de que monte HomePage
 */
export function bootstrapCatalog(): void {
  if (started || !env.apiUrl) return
  started = true

  const origin = env.apiUrl
  if (!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
    const link = document.createElement("link")
    link.rel = "preconnect"
    link.href = origin
    document.head.appendChild(link)
  }

  void fetch(`${env.apiUrl}/api/ping`, { method: "GET" }).catch(() => {})

  const key = cacheKeys.books(defaultCatalogParams)
  if (cacheIsFresh(cacheGet(key))) return

  void cacheInflight(key, () => api.books(defaultCatalogParams))
    .then((data) => cacheSet(key, data, CATALOG_TTL_MS))
    .catch(() => {})
}

export { CATALOG_PAGE_SIZE }
