import { useEffect, useState } from "react"
import {
  Ban,
  BookOpen,
  Check,
  Flag,
  LogOut,
  MapPin,
  Search,
  Shield,
  Store,
  Trash2,
  X,
} from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/context/AuthContext"
import { StoreAvatar } from "@/components/stores/StoreAvatar"
import {
  api,
  cacheKeys,
  type AdminStats,
  type BannedUser,
  type Book,
  type ReportedBook,
  type Store as StoreType,
} from "@/lib/api"
import { useCachedQuery } from "@/lib/useCachedQuery"
import { cn, formatPrice } from "@/lib/utils"

type Tab = "books" | "stores" | "reports" | "banned"

type PendingAction =
  | { kind: "book"; id: string; titulo: string }
  | { kind: "store"; id: string; nombre: string; count: number }
  | { kind: "unban"; id: string; nombre: string }
  | { kind: "logout" }

type ResolveAction = {
  bookId: string
  titulo: string
  decision: "valid" | "invalid"
}

const ADMIN_TTL_MS = 30_000

const REASON_LABELS: Record<string, string> = {
  contenido_inapropiado: "Contenido inapropiado",
  no_es_libro_fisico: "No es libro físico",
  fraude_estafa: "Fraude o estafa",
  otro: "Otro",
}

export function AdminPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [tab, setTab] = useState<Tab>("reports")
  const [pending, setPending] = useState<PendingAction | null>(null)
  const [resolveAction, setResolveAction] = useState<ResolveAction | null>(null)
  const [banOwner, setBanOwner] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const isAdmin = !!user?.is_admin

  // El admin solo usa este panel: "atrás" del navegador no sale a la app general.
  useEffect(() => {
    if (!isAdmin) return
    const stayOnAdmin = () => {
      window.history.pushState({ adminPanel: true }, "", "#/admin")
    }
    stayOnAdmin()
    window.addEventListener("popstate", stayOnAdmin)
    return () => window.removeEventListener("popstate", stayOnAdmin)
  }, [isAdmin])

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

  const {
    data: reportsData,
    loading: loadingReports,
    refetch: refetchReports,
  } = useCachedQuery<ReportedBook[]>({
    key: isAdmin && tab === "reports" ? cacheKeys.adminReports() : null,
    fetcher: () => api.adminReports(),
    ttlMs: ADMIN_TTL_MS,
    enabled: isAdmin && tab === "reports",
  })

  const {
    data: bannedData,
    loading: loadingBanned,
    refetch: refetchBanned,
  } = useCachedQuery<BannedUser[]>({
    key: isAdmin && tab === "banned" ? cacheKeys.adminBanned() : null,
    fetcher: () => api.adminBanned(),
    ttlMs: ADMIN_TTL_MS,
    enabled: isAdmin && tab === "banned",
  })

  const books = booksData ?? []
  const stores = storesData ?? []
  const reports = reportsData ?? []
  const banned = bannedData ?? []

  const loading =
    tab === "books"
      ? loadingBooks
      : tab === "stores"
        ? loadingStores
        : tab === "reports"
          ? loadingReports
          : loadingBanned

  if (!user?.is_admin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 text-gray-500">
        Acceso restringido a administradores.
      </div>
    )
  }

  const initial = (user.nombre_tienda || user.whatsapp_number).charAt(0).toUpperCase()

  const emptyLabel =
    tab === "books"
      ? search
        ? "No hay libros con esa búsqueda."
        : "No hay libros publicados."
      : tab === "stores"
        ? search
          ? "No hay tiendas con esa búsqueda."
          : "No hay tiendas registradas."
        : tab === "reports"
          ? "No hay libros reportados pendientes."
          : "No hay cuentas baneadas."

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
      } else if (pending.kind === "unban") {
        await api.adminUnban(pending.id)
        await Promise.all([refetchBanned(), refetchStats()])
      } else if (pending.kind === "logout") {
        logout()
        navigate("/login", { replace: true })
      }
      setPending(null)
    } finally {
      setProcessing(false)
    }
  }

  const confirmResolve = async () => {
    if (!resolveAction) return
    setProcessing(true)
    try {
      await api.adminResolveReport(resolveAction.bookId, {
        decision: resolveAction.decision,
        ban_owner: resolveAction.decision === "valid" && banOwner,
      })
      setResolveAction(null)
      setBanOwner(false)
      await Promise.all([refetchReports(), refetchStats(), refetchBanned(), refetchBooks()])
    } finally {
      setProcessing(false)
    }
  }

  const confirmTitle =
    pending?.kind === "book"
      ? "Eliminar libro"
      : pending?.kind === "store"
        ? "Eliminar tienda"
        : pending?.kind === "unban"
          ? "Quitar baneo"
          : "Cerrar sesión"

  const confirmDescription =
    pending?.kind === "book"
      ? `“${pending.titulo}” será eliminado permanentemente de la plataforma.`
      : pending?.kind === "store"
        ? `Se eliminará la tienda “${pending.nombre}” junto con sus ${pending.count} libros. Esta acción no se puede deshacer.`
        : pending?.kind === "unban"
          ? `“${pending.nombre}” podrá volver a iniciar sesión y publicar libros.`
          : pending?.kind === "logout"
            ? "Tendrás que volver a ingresar tus credenciales para acceder al panel."
            : ""

  const confirmLabel =
    pending?.kind === "logout"
      ? "Cerrar sesión"
      : pending?.kind === "unban"
        ? "Quitar baneo"
        : "Eliminar"

  const confirmVariant: "destructive" | "default" =
    pending?.kind === "logout" || pending?.kind === "unban" ? "default" : "destructive"

  const resolveTitle =
    resolveAction?.decision === "valid"
      ? "Confirmar reporte válido"
      : "Marcar reporte como inválido"

  const resolveDescription =
    resolveAction?.decision === "valid"
      ? `“${resolveAction.titulo}” se eliminará de la plataforma.${
          banOwner
            ? " La cuenta del vendedor también será baneada y se eliminarán todos sus libros."
            : ""
        }`
      : resolveAction
        ? `“${resolveAction.titulo}” permanecerá publicado y no podrá volver a ser denunciado.`
        : ""

  const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
    { id: "reports", label: "Reportes", icon: Flag },
    { id: "banned", label: "Baneados", icon: Ban },
    { id: "books", label: "Libros", icon: BookOpen },
    { id: "stores", label: "Tiendas", icon: Store },
  ]

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
            Reportes, baneos, libros y tiendas de LibrosCuba
          </p>

          <Card className="mt-4 border-0 bg-white/95 shadow-lg">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand text-lg font-bold text-white">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-gray-900">{user.nombre_tienda}</p>
                <p className="truncate text-sm text-gray-500">{user.whatsapp_number}</p>
                <p className="mt-0.5 text-xs font-medium text-brand">Superusuario</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-4 pb-8 md:max-w-4xl">
        {stats && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Card className="border-amber-200 bg-amber-50/80">
              <CardContent className="p-3 sm:p-4">
                <Flag className="mb-2 h-5 w-5 text-amber-700" />
                <p className="text-2xl font-bold text-gray-900">{stats.reportes_pendientes}</p>
                <p className="text-xs text-gray-600">Reportes pendientes</p>
              </CardContent>
            </Card>
            <Card className="border-red-200 bg-red-50/80">
              <CardContent className="p-3 sm:p-4">
                <Ban className="mb-2 h-5 w-5 text-red-700" />
                <p className="text-2xl font-bold text-gray-900">{stats.cuentas_baneadas}</p>
                <p className="text-xs text-gray-600">Cuentas baneadas</p>
              </CardContent>
            </Card>
            <Card className="border-brand/20 bg-brand-light/50">
              <CardContent className="p-3 sm:p-4">
                <BookOpen className="mb-2 h-5 w-5 text-brand" />
                <p className="text-2xl font-bold text-gray-900">{stats.total_libros_activos}</p>
                <p className="text-xs text-gray-600">Libros activos</p>
              </CardContent>
            </Card>
            <Card className="border-brand/20 bg-brand-light/50">
              <CardContent className="p-3 sm:p-4">
                <Store className="mb-2 h-5 w-5 text-brand" />
                <p className="text-2xl font-bold text-gray-900">{stats.total_tiendas}</p>
                <p className="text-xs text-gray-600">Tiendas creadas</p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-2 gap-1 rounded-xl border border-gray-100 bg-white p-1 shadow-sm sm:grid-cols-4">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setTab(id)
                setSearchInput("")
                setSearch("")
              }}
              className={cn(
                "flex items-center justify-center gap-1.5 rounded-lg py-3 text-xs font-semibold min-h-11 transition-colors sm:text-sm",
                tab === id ? "bg-brand text-paper shadow-sm" : "text-gray-600"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </div>

        {(tab === "books" || tab === "stores") && (
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
        )}

        {loading ? (
          <p className="py-8 text-center text-sm text-gray-500">Cargando...</p>
        ) : tab === "reports" ? (
          reports.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">{emptyLabel}</p>
          ) : (
            <ul className="space-y-3">
              {reports.map((report) => (
                <li
                  key={report.book_id}
                  className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex gap-3">
                    <img
                      src={report.foto_url}
                      alt=""
                      className="h-20 w-14 shrink-0 rounded-lg object-cover bg-gray-100"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{report.titulo}</p>
                      <p className="text-sm text-gray-500">{report.autor}</p>
                      <p className="mt-1 text-sm font-medium text-brand">
                        {formatPrice(report.precio)}
                      </p>
                      <Badge variant="secondary" className="mt-2">
                        {REASON_LABELS[report.reason] ?? report.reason}
                      </Badge>
                      {report.details && (
                        <p className="mt-2 text-xs text-gray-600 line-clamp-3">{report.details}</p>
                      )}
                      <p className="mt-2 text-xs text-gray-400">
                        Reportado por:{" "}
                        {report.reporter_id ? `usuario ${report.reporter_id.slice(0, 8)}…` : "visitante anónimo"}
                      </p>
                      <p className="text-xs text-gray-400">
                        Tienda: {report.owner_nombre_tienda ?? "—"}
                        {report.owner_whatsapp ? ` · ${report.owner_whatsapp}` : ""}
                      </p>
                      <p className="text-xs text-gray-400">
                        {report.municipio}, {report.provincia}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant="destructive"
                      className="flex-1 gap-2"
                      onClick={() => {
                        setBanOwner(false)
                        setResolveAction({
                          bookId: report.book_id,
                          titulo: report.titulo,
                          decision: "valid",
                        })
                      }}
                    >
                      <Check className="h-4 w-4" />
                      Reporte válido (eliminar)
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      className="flex-1 gap-2"
                      onClick={() => {
                        setBanOwner(false)
                        setResolveAction({
                          bookId: report.book_id,
                          titulo: report.titulo,
                          decision: "invalid",
                        })
                      }}
                    >
                      <X className="h-4 w-4" />
                      Reporte inválido
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : tab === "banned" ? (
          banned.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">{emptyLabel}</p>
          ) : (
            <ul className="space-y-2">
              {banned.map((account) => (
                <li
                  key={account.id}
                  className="rounded-2xl border border-red-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900">{account.nombre_tienda}</p>
                      <p className="mt-0.5 text-sm text-gray-500">{account.whatsapp_number}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {account.municipio}, {account.provincia}
                      </p>
                      {account.ban_reason && (
                        <p className="mt-2 text-xs text-red-700">{account.ban_reason}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        Baneado:{" "}
                        {new Date(account.banned_at).toLocaleString("es-CU", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        setPending({
                          kind: "unban",
                          id: account.id,
                          nombre: account.nombre_tienda,
                        })
                      }
                    >
                      Quitar baneo
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )
        ) : tab === "books" ? (
          books.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-500">{emptyLabel}</p>
          ) : (
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
          )
        ) : stores.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-500">{emptyLabel}</p>
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

      <ConfirmDialog
        open={resolveAction !== null}
        onOpenChange={(o) => {
          if (!o) {
            setResolveAction(null)
            setBanOwner(false)
          }
        }}
        title={resolveTitle}
        description={resolveDescription}
        confirmLabel={resolveAction?.decision === "valid" ? "Confirmar y eliminar" : "Confirmar"}
        variant={resolveAction?.decision === "valid" ? "destructive" : "default"}
        loading={processing}
        onConfirm={confirmResolve}
      >
        {resolveAction?.decision === "valid" && (
          <label className="mt-4 flex cursor-pointer items-start gap-3 rounded-lg border border-red-100 bg-red-50/50 p-3">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded border-gray-300"
              checked={banOwner}
              onChange={(e) => setBanOwner(e.target.checked)}
            />
            <span>
              <Label className="cursor-pointer font-medium text-gray-900">
                Banear también la cuenta del vendedor
              </Label>
              <span className="mt-0.5 block text-xs font-normal text-gray-600">
                Elimina todos sus libros y bloquea el acceso. Aparecerá en la sección de baneados.
              </span>
            </span>
          </label>
        )}
      </ConfirmDialog>
    </div>
  )
}
