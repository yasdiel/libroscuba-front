import { useCallback, useEffect, useRef, useState } from "react"
import { BookOpen, Loader2, Search } from "lucide-react"
import { BookCard } from "@/components/books/BookCard"
import { BookSheet } from "@/components/books/BookSheet"
import { LocationFilter } from "@/components/filters/LocationFilter"
import { Input } from "@/components/ui/input"
import { api, ApiError, type Book } from "@/lib/api"

const PAGE_SIZE = 40

export function HomePage() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [provincia, setProvincia] = useState("")
  const [municipio, setMunicipio] = useState("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Book | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  // Token para descartar respuestas obsoletas si los filtros cambian a mitad de fetch.
  const requestIdRef = useRef(0)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const loadFirstPage = useCallback(async () => {
    const id = ++requestIdRef.current
    setLoading(true)
    setError(null)
    setHasMore(true)
    try {
      const data = await api.books({
        provincia: provincia || undefined,
        municipio: municipio || undefined,
        q: search || undefined,
        skip: 0,
        limit: PAGE_SIZE,
      })
      if (id !== requestIdRef.current) return
      setBooks(data)
      setHasMore(data.length === PAGE_SIZE)
    } catch (e) {
      if (id !== requestIdRef.current) return
      setBooks([])
      setHasMore(false)
      setError(e instanceof ApiError ? e.message : "No se pudieron cargar los libros")
    } finally {
      if (id === requestIdRef.current) setLoading(false)
    }
  }, [provincia, municipio, search])

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore || error) return
    const id = requestIdRef.current
    setLoadingMore(true)
    try {
      const data = await api.books({
        provincia: provincia || undefined,
        municipio: municipio || undefined,
        q: search || undefined,
        skip: books.length,
        limit: PAGE_SIZE,
      })
      if (id !== requestIdRef.current) return
      setBooks((prev) => [...prev, ...data])
      setHasMore(data.length === PAGE_SIZE)
    } catch {
      if (id !== requestIdRef.current) return
      setHasMore(false)
    } finally {
      if (id === requestIdRef.current) setLoadingMore(false)
    }
  }, [provincia, municipio, search, books.length, loading, loadingMore, hasMore, error])

  useEffect(() => {
    const t = setTimeout(loadFirstPage, 300)
    return () => clearTimeout(t)
  }, [loadFirstPage])

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

  return (
    <div className="pb-4">
      <header className="bg-gradient-to-br from-brand to-brand-dark px-4 pb-6 pt-6 text-white rounded-b-3xl">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="h-7 w-7" />
          <h1 className="text-2xl font-bold">LibrosCuba</h1>
        </div>
        <p className="text-sm text-white/85 mb-4">
          Libros físicos en toda Cuba. Compra directo por WhatsApp.
        </p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            className="border-0 bg-white pl-10 text-gray-900 shadow-lg"
            placeholder="Buscar por título o autor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <section className="px-4 py-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Filtrar por ubicación</h2>
        <LocationFilter
          provincia={provincia}
          municipio={municipio}
          onProvinciaChange={setProvincia}
          onMunicipioChange={setMunicipio}
        />
      </section>

      <section className="px-4">
        <h2 className="mb-3 text-lg font-bold text-gray-900">
          {search.trim() ? "Resultados" : "Recién llegados"}
        </h2>
        {loading ? (
          <p className="text-center text-gray-500 py-8">Cargando libros...</p>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-800">
            <p className="font-medium mb-1">Error al cargar libros</p>
            <p>{error}</p>
            <button
              type="button"
              className="mt-3 text-brand font-semibold underline"
              onClick={() => loadFirstPage()}
            >
              Reintentar
            </button>
          </div>
        ) : books.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No hay libros con estos filtros.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
              {books.map((book) => (
                <BookCard key={book.id} book={book} onClick={() => openBook(book)} />
              ))}
            </div>
            <div ref={sentinelRef} className="h-1" aria-hidden />
            {loadingMore && (
              <p className="flex items-center justify-center gap-2 py-6 text-sm text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                Cargando más libros...
              </p>
            )}
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
