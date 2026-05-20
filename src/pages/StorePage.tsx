import { useEffect, useState } from "react"
import { ArrowLeft, BookOpen, MapPin, MessageCircle, Search, Store as StoreIcon, Truck } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { BookCard } from "@/components/books/BookCard"
import { BookCardSkeletonGrid, bookCardGridClass } from "@/components/books/BookCardSkeleton"
import { BookSheet } from "@/components/books/BookSheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { StoreAvatar } from "@/components/stores/StoreAvatar"
import { api, cacheKeys, type Book, type Store } from "@/lib/api"
import { useCachedQuery } from "@/lib/useCachedQuery"

const STORE_TTL_MS = 60_000
const STORE_BOOKS_TTL_MS = 60_000

export function StorePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<Book | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 250)
    return () => clearTimeout(t)
  }, [searchInput])

  const {
    data: store,
    loading: loadingStore,
    error: storeError,
  } = useCachedQuery<Store>({
    key: id ? cacheKeys.store(id) : null,
    fetcher: () => api.store(id as string),
    ttlMs: STORE_TTL_MS,
    enabled: !!id,
  })

  const {
    data: booksData,
    loading: loadingBooks,
  } = useCachedQuery<Book[]>({
    key: id ? cacheKeys.storeBooks(id, search || undefined) : null,
    fetcher: () => api.storeBooks(id as string, search || undefined),
    ttlMs: STORE_BOOKS_TTL_MS,
    enabled: !!id,
  })

  const books = booksData ?? []

  const openBook = (book: Book) => {
    setSelected(book)
    setSheetOpen(true)
  }

  const waLink = store
    ? `https://wa.me/${store.whatsapp_number.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Hola ${store.nombre_tienda}, vi tu tienda en LibrosCuba.`
      )}`
    : null

  if (loadingStore) {
    return <p className="px-4 py-8 text-center text-gray-500">Cargando tienda...</p>
  }

  if (storeError || !store) {
    return (
      <div className="px-4 py-10 text-center space-y-3">
        <StoreIcon className="mx-auto h-10 w-10 text-gray-400" />
        <p className="text-gray-600">{storeError?.message ?? "Tienda no encontrada"}</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>
    )
  }

  return (
    <div className="pb-6">
      <header className="bg-gradient-to-br from-brand to-brand-dark px-4 pb-6 pt-4 text-white rounded-b-3xl">
        <Link
          to="/"
          className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-white/85 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <div className="flex items-start gap-3">
          <StoreAvatar
            nombreTienda={store.nombre_tienda}
            fotoUrl={store.foto_tienda_url}
            size="md"
            onDark
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium uppercase tracking-wide text-white/80">Tienda</p>
            <h1 className="text-xl font-bold leading-tight">{store.nombre_tienda}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-white/85">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="truncate">
                {store.municipio}, {store.provincia}
              </span>
            </p>
          </div>
        </div>

        <Card className="mt-4 border-0 bg-white/95 shadow-lg">
          <CardContent className="space-y-3 p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <BookOpen className="mb-1 h-5 w-5 text-brand" />
                <p className="text-2xl font-bold text-gray-900">{store.book_count}</p>
                <p className="text-xs text-gray-600">Libros publicados</p>
              </div>
              {waLink && (
                <Button asChild className="self-end gap-2">
                  <a href={waLink} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                </Button>
              )}
            </div>
            {store.municipios_envio.length > 0 && (
              <div className="border-t border-gray-100 pt-3">
                <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
                  <Truck className="h-3.5 w-3.5 text-brand" />
                  Envíos también a
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {store.municipios_envio.map((m) => (
                    <Badge key={m} variant="secondary" className="text-xs">
                      {m}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </header>

      <section className="px-4 pt-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Buscar en esta tienda..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <h2 className="pt-1 text-lg font-bold text-gray-900">
          {search.trim() ? "Resultados" : "Catálogo"}
        </h2>

        {loadingBooks ? (
          <BookCardSkeletonGrid
            count={Math.min(Math.max(store.book_count, 4), 40)}
          />
        ) : books.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            {search.trim()
              ? "Esta tienda no tiene libros que coincidan."
              : "Esta tienda aún no tiene libros publicados."}
          </p>
        ) : (
          <div className={bookCardGridClass}>
            {books.map((book) => (
              <BookCard key={book.id} book={book} onClick={() => openBook(book)} />
            ))}
          </div>
        )}
      </section>

      <BookSheet book={selected} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  )
}
