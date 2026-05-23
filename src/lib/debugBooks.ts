import type { Book } from "@/lib/api"

/** Log en consola en cuanto llega el JSON de libros (depuración de tiempos de carga). */
export function logBooksJsonReady(
  source: string,
  books: Book[],
  meta?: { params?: unknown; ms?: number }
) {
  const timing = meta?.ms != null ? ` (${meta.ms} ms)` : ""
  console.log(
    `[LibrosCuba] JSON libros listo${timing} — ${source}`,
    books.length,
    "libro(s)",
    meta?.params ?? "",
    books
  )
}
