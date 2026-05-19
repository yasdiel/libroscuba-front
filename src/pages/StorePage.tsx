import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, BookOpen, MapPin, MessageCircle, Search, Store as StoreIcon, Truck } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { BookCard } from "@/components/books/BookCard"
import { BookSheet } from "@/components/books/BookSheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { api, ApiError, type Book, type Store } from "@/lib/api"

export function StorePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [store, setStore] = useState<Store | null>(null)
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState("")
  const [loadingStore, setLoadingStore] = useState(true)
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Book | null>(null)
  const [sheetOpen, setSheetOpen] = useState(false)

  const loadStore = useCallback(async () => {
    if (!id) return
    setLoadingStore(true)
    setError(null)
    try {
      setStore(await api.store(id))
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Tienda no encontrada")
      setStore(null)
    } finally {
      setLoadingStore(false)
    }
  }, [id])

  const loadBooks = useCallback(async () => {
    if (!id) return
    setLoadingBooks(true)
    try {
      setBooks(await api.storeBooks(id, search || undefined))
    } catch {
      setBooks([])
    } finally {
      setLoadingBooks(false)
    }
  }, [id, search])

  useEffect(() => {
    loadStore()
  }, [loadStore])

  useEffect(() => {
    const t = setTimeout(loadBooks, 250)
    return () => clearTimeout(t)
  }, [loadBooks])

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

  if (error || !store) {
    return (
      <div className="px-4 py-10 text-center space-y-3">
        <StoreIcon className="mx-auto h-10 w-10 text-gray-400" />
        <p className="text-gray-600">{error ?? "Tienda no encontrada"}</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Volver al inicio
        </Button>
      </div>
    )
  }

  const initial = store.nombre_tienda.charAt(0).toUpperCase()

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
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur">
            {initial}
          </div>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <h2 className="pt-1 text-lg font-bold text-gray-900">
          {search.trim() ? "Resultados" : "Catálogo"}
        </h2>

        {loadingBooks ? (
          <p className="py-8 text-center text-gray-500">Cargando libros...</p>
        ) : books.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">
            {search.trim()
              ? "Esta tienda no tiene libros que coincidan."
              : "Esta tienda aún no tiene libros publicados."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
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
