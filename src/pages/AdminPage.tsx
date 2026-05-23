import { useEffect, useState } from "react"
import { BookOpen, LogOut, MapPin, Search, Shield, Store, Trash2 } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { StoreAvatar } from "@/components/stores/StoreAvatar"
import { api, cacheKeys, type AdminStats, type Book, type Store as StoreType } from "@/lib/api"
import { useCachedQuery } from "@/lib/useCachedQuery"
import { cn, formatPrice } from "@/lib/utils"

type PendingAction =
  | { kind: "book"; id: string; titulo: string }
  | { kind: "store"; id: string; nombre: string; count: number }
  | { kind: "logout" }

const ADMIN_TTL_MS = 30_000

export function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<"books" | "stores">("books")
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const isAdmin = !!user?.is_admin

  const { data: stats, refetch: refetchStats } = useCachedQuery<AdminStats>({
    key: isAdmin ? cacheKeys.adminStats() : null,
    fetcher: () => api.adminStats(),
    ttlMs: ADMIN_TTL_MS,
    enabled: isAdmin,
  })

  const {
    data: booksData,
    loading: loadingBooks,
    refetch: refetchBooks,
  } = useCachedQuery<Book[]>({
    key: isAdmin && tab === "books" ? cacheKeys.adminBooks(search || undefined) : null,
    fetcher: () => api.adminBooks(search || undefined),
    ttlMs: ADMIN_TTL_MS,
    enabled: isAdmin && tab === "books",
  })

  const {
    data: storesData,
    loading: loadingStores,
    refetch: refetchStores,
  } = useCachedQuery<StoreType[]>({
    key: isAdmin && tab === "stores" ? cacheKeys.adminStores(search || undefined) : null,
    fetcher: () => api.adminStores(search || undefined),
    ttlMs: ADMIN_TTL_MS,
    enabled: isAdmin && tab === "stores",
  })

  const books = booksData ?? []
  const stores = storesData ?? []
  const loading = tab === "books" ? loadingBooks : loadingStores

  if (!user?.is_admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-500">
        Acceso restringido a administradores.
      </div>
    )
  }

  const initial = (user.nombre_tienda || user.whatsapp_number).charAt(0).toUpperCase()
  const list = tab === "books" ? books : stores
  const emptyLabel =
    tab === "books"
      ? search
        ? "No hay libros con esa búsqueda."
        : "No hay libros publicados."
      : search
        ? "No hay tiendas con esa búsqueda."
        : "No hay tiendas registradas."

  const confirmPending = async () => {
    if (!pending) return
    setProcessing(true)
    try {
      if (pending.kind === "book") {
        await api.adminDeleteBook(pending.id)
        await Promise.all([refetchBooks(), refetchStats()])
      } else if (pending.kind === "store") {
        await api.adminDeleteStore(pending.id)
        await Promise.all([refetchStores(), refetchStats()])
      } else if (pending.kind === "logout") {
        logout()
        navigate("/")
      }
      setPending(null)
    } finally {
      setProcessing(false)
    }
  }

  const confirmTitle =
    pending?.kind === "book"
      ? "Eliminar libro"
      : pending?.kind === "store"
        ? "Eliminar tienda"
        : "Cerrar sesión"

  const confirmDescription =
    pending?.kind === "book"
      ? `“${pending.titulo}” será eliminado permanentemente de la plataforma.`
      : pending?.kind === "store"
        ? `Se eliminará la tienda “${pending.nombre}” junto con sus ${pending.count} libros. Esta acción no se puede deshacer.`
        : pending?.kind === "logout"
          ? "Tendrás que volver a ingresar tus credenciales para acceder al panel."
          : ""

  const confirmLabel =
    pending?.kind === "logout" ? "Cerrar sesión" : "Eliminar"

  const confirmVariant: "destructive" | "default" =
    pending?.kind === "logout" ? "default" : "destructive"

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="vintage-header px-4 pb-6 pt-4">
        <div className="mx-auto max-w-lg md:max-w-4xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-semibold tracking-wide">ADMIN</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/15"
              onClick={() => setPending({ kind: "logout" })}
              aria-label="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>

          <h1 className="text-2xl font-bold">Panel de moderación</h1>
          <p className="mt-1 text-sm text-white/85">
            Gestiona libros y tiendas de LibrosCuba
          </p>

          <Card className="mt-4 border-0 bg-white/95 shadow-lg">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{user.nombre_tienda}</p>
                <p className="truncate text-sm text-gray-500">{user.whatsapp_number}</p>
                <p className="mt-0.5 text-xs text-brand font-medium">Superusuario</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-4 pb-8 md:max-w-4xl">
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-brand/20 bg-brand-light/50">
              <CardContent className="p-4">
                <BookOpen className="mb-2 h-5 w-5 text-brand" />
                <p className="text-2xl font-bold text-gray-900">{stats.total_libros_activos}</p>
                <p className="text-xs text-gray-600">Libros activos</p>
              </CardContent>
            </Card>
            <Card className="border-brand/20 bg-brand-light/50">
              <CardContent className="p-4">
                <Store className="mb-2 h-5 w-5 text-brand" />
                <p className="text-2xl font-bold text-gray-900">{stats.total_tiendas}</p>
                <p className="text-xs text-gray-600">Tiendas creadas</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="flex rounded-xl bg-white p-1 shadow-sm border border-gray-100">
          {(["books", "stores"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t)
                setSearchInput("")
                setSearch("")
              }}
              className={cn(
                "flex-1 rounded-lg py-3 text-sm font-semibold min-h-12 transition-colors",
                tab === t ? "bg-brand text-paper shadow-sm" : "text-gray-600"
              )}
            >
              {t === "books" ? "Libros" : "Tiendas"}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            className="border-gray-200 bg-white pl-10 shadow-sm"
            placeholder={
              tab === "books"
                ? "Buscar por título o autor..."
                : "Buscar por tienda, teléfono o ubicación..."
            }
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">Cargando...</p>
        ) : list.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">{emptyLabel}</p>
        ) : tab === "books" ? (
          <ul className="space-y-2">
            {books.map((book) => (
              <li
                key={book.id}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-3 shadow-sm"
              >
                <img
                  src={book.foto_url}
                  alt=""
                  className="h-16 w-12 shrink-0 rounded-lg object-cover bg-gray-100"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 truncate">{book.titulo}</p>
                  <p className="text-sm text-gray-500 truncate">{book.autor}</p>
                  <p className="mt-1 text-sm font-medium text-brand">{formatPrice(book.precio)}</p>
                  {book.owner_whatsapp && (
                    <p className="text-xs text-gray-400 truncate">{book.owner_whatsapp}</p>
                  )}
                </div>
                <Button
                  size="icon"
                  variant="destructive"
                  className="shrink-0"
                  onClick={() =>
                    setPending({ kind: "book", id: book.id, titulo: book.titulo })
                  }
                  aria-label="Eliminar libro"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <ul className="space-y-2">
            {stores.map((store) => (
              <li
                key={store.id}
                className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <StoreAvatar
                    nombreTienda={store.nombre_tienda}
                    fotoUrl={store.foto_tienda_url}
                    size="sm"
                    className="rounded-xl"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-gray-900">{store.nombre_tienda}</p>
                      <Badge variant="secondary">{store.book_count} libros</Badge>
                    </div>
                    <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      {store.municipio}, {store.provincia}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">{store.whatsapp_number}</p>
                  </div>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="shrink-0"
                    onClick={() =>
                      setPending({
                        kind: "store",
                        id: store.id,
                        nombre: store.nombre_tienda,
                        count: store.book_count,
                      })
                    }
                    aria-label="Eliminar tienda"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>

      <ConfirmDialog
        open={pending !== null}
        onOpenChange={(o) => !o && setPending(null)}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel={confirmLabel}
        variant={confirmVariant}
        loading={processing}
        onConfirm={confirmPending}
        icon={pending?.kind === "logout" ? <LogOut className="h-5 w-5" /> : undefined}
      />
    </div>
  )
}

