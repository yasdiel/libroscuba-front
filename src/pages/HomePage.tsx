import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { BookOpen, Loader2, Search } from "lucide-react"
import { BookCard } from "@/components/books/BookCard"
import { BookCardSkeletonGrid, bookCardGridClass } from "@/components/books/BookCardSkeleton"
import { BookSheet } from "@/components/books/BookSheet"
import { LocationFilter } from "@/components/filters/LocationFilter"
import { Input } from "@/components/ui/input"
import { CATALOG_PAGE_SIZE } from "@/lib/catalog"
import { logBooksJsonReady } from "@/lib/debugBooks"
import { api, cacheKeys, type Book } from "@/lib/api"
import { useCachedQuery } from "@/lib/useCachedQuery"

const PAGE_SIZE = CATALOG_PAGE_SIZE
// La cache de la primera página se considera fresca 60 s.
// Tras eso, al volver al home, vuelve a pedirla en segundo plano.
const BOOKS_TTL_MS = 60_000

export function HomePage() {
  const [provincia, setProvincia] = useState("")
  const [municipio, setMunicipio] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [extraBooks, setExtraBooks] = useState<Book[]>([])
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selected, setSelected] = useState<Book | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const sentinelRef = useRef<HTMLDivElement | null>(null)

  // Debounce del campo de búsqueda → search efectivo.
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const filterParams = useMemo(
    () => ({
      provincia: provincia || undefined,
      municipio: municipio || undefined,
      q: search || undefined,
      skip: 0,
      limit: PAGE_SIZE,
    }),
    [provincia, municipio, search]
  )

  const {
    data: firstPage,
    loading,
    isFetching,
    error,
    refetch,
  } = useCachedQuery<Book[]>({
    key: cacheKeys.books(filterParams),
    fetcher: () => api.books(filterParams),
    ttlMs: BOOKS_TTL_MS,
  })

  useEffect(() => {
    if (firstPage) {
      logBooksJsonReady("HomePage (datos en pantalla)", firstPage, {
        params: filterParams,
      })
    }
  }, [firstPage, filterParams])

  // Al cambiar filtros se reinicia el infinite scroll local.
  useEffect(() => {
    setExtraBooks([])
    setHasMore(true)
  }, [provincia, municipio, search])

  // Si la primera página vino con menos de PAGE_SIZE, ya no hay más.
  useEffect(() => {
    if (firstPage && firstPage.length < PAGE_SIZE && extraBooks.length === 0) {
      setHasMore(false)
    }
  }, [firstPage, extraBooks.length])

  const books = useMemo<Book[]>(() => {
    if (!firstPage) return []
    if (extraBooks.length === 0) return firstPage
    const seen = new Set(firstPage.map((b) => b.id))
    const merged = [...firstPage]
    for (const b of extraBooks) {
      if (!seen.has(b.id)) {
        seen.add(b.id)
        merged.push(b)
      }
    }
    return merged
  }, [firstPage, extraBooks])

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore || error) return
    if (!firstPage) return
    setLoadingMore(true)
    try {
      const data = await api.books({
        ...filterParams,
        skip: books.length,
      })
      setExtraBooks((prev) => [...prev, ...data])
      if (data.length < PAGE_SIZE) setHasMore(false)
    } catch {
      setHasMore(false)
    } finally {
      setLoadingMore(false)
    }
  }, [filterParams, books.length, firstPage, loading, loadingMore, hasMore, error])

  useEffect(() => {
    const node = sentinelRef.current
    if (!node) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) loadMore()
      },
      { rootMargin: "300px 0px" }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [loadMore])

  const openBook = (book: Book) => {
    setSelected(book)
    setSheetOpen(true)
  }

  const showStaleIndicator = isFetching && books.length > 0

  return (
    <div className="pb-4">
      <header className="vintage-header rounded-b-3xl px-4 pb-6 pt-6">
        <div className="mb-1 flex items-center gap-2">
          <BookOpen className="h-7 w-7 text-paper/90" />
          <h1 className="font-display text-2xl font-bold tracking-tight">LibrosCuba</h1>
        </div>
        <p className="mb-4 text-sm text-paper/85">
          Libros físicos en toda Cuba. Compra directo por WhatsApp.
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            className="border-0 bg-paper pl-10 text-gray-900 shadow-md"
            placeholder="Buscar por título o autor..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </header>

      <section className="px-4 py-4 space-y-3">
        <h2 className="font-display text-sm font-semibold text-gray-700">Filtrar por ubicación</h2>
        <LocationFilter
          provincia={provincia}
          municipio={municipio}
          onProvinciaChange={setProvincia}
          onMunicipioChange={setMunicipio}
        />
      </section>

      <section className="px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold text-gray-900">
            {search.trim() ? "Resultados" : "Recién llegados"}
          </h2>
          {showStaleIndicator && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Loader2 className="h-3 w-3 animate-spin" />
              Actualizando
            </span>
          )}
        </div>
        {loading ? (
          <BookCardSkeletonGrid count={PAGE_SIZE} />
        ) : error && books.length === 0 ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-800">
            <p className="font-medium mb-1">Error al cargar libros</p>
            <p>{error.message}</p>
            <button
              type="button"
              className="mt-3 text-brand font-semibold underline"
              onClick={() => refetch()}
            >
              Reintentar
            </button>
          </div>
        ) : books.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay libros con estos filtros.</p>
        ) : (
          <>
            <div className={bookCardGridClass}>
              {books.map((book) => (
                <BookCard key={book.id} book={book} onClick={() => openBook(book)} />
              ))}
            </div>
            <div ref={sentinelRef} className="h-1" aria-hidden />
            {loadingMore && <BookCardSkeletonGrid count={4} className="mt-3" />}
            {!hasMore && !loadingMore && books.length > PAGE_SIZE && (
              <p className="py-6 text-center text-xs text-gray-400">
                Has visto los {books.length} libros disponibles.
              </p>
            )}
          </>
        )}
      </section>

      <BookSheet book={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  )
}
