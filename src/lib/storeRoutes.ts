/** Ruta pública de una tienda (HashRouter: #/tienda/slug). */
export function storePath(slug: string): string {
  return `/tienda/${encodeURIComponent(slug)}`
}
