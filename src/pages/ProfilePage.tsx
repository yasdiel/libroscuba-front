import { useMemo, useState } from "react"
import { LogOut, Pencil, Search, Store, Trash2, Truck } from "lucide-react"
import { Navigate, useNavigate } from "react-router-dom"
import { BookCard } from "@/components/books/BookCard"
import { BookForm, type BookFormData } from "@/components/books/BookForm"
import { MunicipiosEnvioSelect } from "@/components/filters/MunicipiosEnvioSelect"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ConfirmDialog } from "@/components/ui/confirm-dialog"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"
import { api, ApiError, cacheKeys, type Book } from "@/lib/api"
import { useCachedQuery } from "@/lib/useCachedQuery"

const MY_BOOKS_TTL_MS = 60_000

export function ProfilePage() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()
  const [bookSearch, setBookSearch] = useState("")
  const [editing, setEditing] = useState<Book | null>(null)
  const [editingShipping, setEditingShipping] = useState(false)
  const [shippingDraft, setShippingDraft] = useState<string[]>([])
  const [savingShipping, setSavingShipping] = useState(false)
  const [shippingError, setShippingError] = useState<string | null>(null)
  const [deletingBook, setDeletingBook] = useState<Book | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [confirmLogout, setConfirmLogout] = useState(false)

  const {
    data: booksData,
    loading,
    refetch: refetchBooks,
  } = useCachedQuery<Book[]>({
    key: user ? cacheKeys.myBooks() : null,
    fetcher: () => api.myBooks(),
    ttlMs: MY_BOOKS_TTL_MS,
    enabled: !!user,
  })
  const books = booksData ?? []

  const filteredBooks = useMemo(() => {
    const q = bookSearch.trim().toLowerCase()
    if (!q) return books
    return books.filter((b) => b.titulo.toLowerCase().includes(q))
  }, [books, bookSearch])

  const startEditShipping = () => {
    setShippingDraft(user?.municipios_envio ?? [])
    setShippingError(null)
    setEditingShipping(true)
  }

  const saveShipping = async () => {
    setSavingShipping(true)
    setShippingError(null)
    try {
      await api.updateProfile({ municipios_envio: shippingDraft })
      await refreshUser()
      setEditingShipping(false)
    } catch (err) {
      setShippingError(
        err instanceof ApiError ? err.message : "No se pudieron guardar los municipios"
      )
    } finally {
      setSavingShipping(false)
    }
  }

  if (user?.is_admin) {
    return <Navigate to="/admin" replace />
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6">
        <Store className="h-12 w-12 text-brand" />
        <p className="text-center text-gray-600">Tu tienda te espera. Regístrate para vender libros físicos.</p>
        <Button onClick={() => navigate("/login")}>Entrar o registrarse</Button>
      </div>
    )
  }

  const handleUpdateBook = async (data: BookFormData) => {
    if (!editing) return
    await api.updateBook(editing.id, { ...data, descripcion: data.descripcion || undefined })
    setEditing(null)
    await refetchBooks()
  }

  const confirmDelete = async () => {
    if (!deletingBook) return
    setDeleting(true)
    try {
      await api.deleteBook(deletingBook.id)
      setDeletingBook(null)
      await refetchBooks()
    } finally {
      setDeleting(false)
    }
  }

  if (editing) {
    return (
      <div className="px-4 py-4">
        <h1 className="mb-4 text-xl font-bold">Editar libro</h1>
        <BookForm
          initial={editing}
          onSubmit={handleUpdateBook}
          onCancel={() => setEditing(null)}
          submitLabel="Guardar cambios"
        />
      </div>
    )
  }

  return (
    <div className="px-4 py-4 space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand">Mi tienda</p>
          <h1 className="text-2xl font-bold">{user.nombre_tienda}</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setConfirmLogout(true)}
          aria-label="Cerrar sesión"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <Card>
        <CardContent className="space-y-2 text-sm">
          <p>
            <span className="text-gray-500">Ubicación:</span> {user.municipio}, {user.provincia}
          </p>
          <p>
            <span className="text-gray-500">Teléfono:</span> {user.whatsapp_number}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-brand" />
              <h3 className="font-semibold text-gray-900">Zonas de envío</h3>
            </div>
            {!editingShipping && (
              <Button size="sm" variant="secondary" onClick={startEditShipping}>
                Editar
              </Button>
            )}
          </div>

          {!editingShipping ? (
            user.municipios_envio.length === 0 ? (
              <p className="text-sm text-gray-500">
                Aún no has añadido municipios. Añádelos para aparecer cuando un comprador filtre por
                su municipio.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {user.municipios_envio.map((m) => (
                  <Badge key={m} variant="secondary">
                    {m}
                  </Badge>
                ))}
              </div>
            )
          ) : (
            <div className="space-y-3">
              <MunicipiosEnvioSelect
                value={shippingDraft}
                onChange={setShippingDraft}
                excludeMunicipio={user.municipio}
                label="Selecciona los municipios"
                hint="Los compradores verán tu tienda al filtrar por estos municipios."
              />
              {shippingError && <p className="text-sm text-red-600">{shippingError}</p>}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setEditingShipping(false)}
                  disabled={savingShipping}
                >
                  Cancelar
                </Button>
                <Button className="flex-1" onClick={saveShipping} disabled={savingShipping}>
                  {savingShipping ? "Guardando..." : "Guardar"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Mi catálogo ({books.length})</h2>
          <Button size="sm" onClick={() => navigate("/publicar")}>
            Añadir libro
          </Button>
        </div>
        {books.length > 0 && (
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por nombre del libro..."
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
            />
          </div>
        )}
        {loading ? (
          <p className="text-gray-500">Cargando...</p>
        ) : books.length === 0 ? (
          <p className="text-gray-500 text-sm">Aún no tienes libros publicados.</p>
        ) : filteredBooks.length === 0 ? (
          <p className="text-gray-500 text-sm">Ningún libro coincide con tu búsqueda.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                actions={
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 min-h-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditing(book)
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 min-h-10"
                      onClick={(e) => {
                        e.stopPropagation()
                        setDeletingBook(book)
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deletingBook}
        onOpenChange={(o) => !o && setDeletingBook(null)}
        title="Eliminar libro"
        description={
          deletingBook
            ? `“${deletingBook.titulo}” se eliminará permanentemente de tu catálogo. Esta acción no se puede deshacer.`
            : ""
        }
        confirmLabel="Eliminar"
        loading={deleting}
        onConfirm={confirmDelete}
      />

      <ConfirmDialog
        open={confirmLogout}
        onOpenChange={setConfirmLogout}
        title="Cerrar sesión"
        description="Tendrás que volver a ingresar tu teléfono y contraseña para acceder a tu tienda."
        confirmLabel="Cerrar sesión"
        icon={<LogOut className="h-5 w-5" />}
        onConfirm={() => {
          setConfirmLogout(false)
          logout()
          navigate("/")
        }}
      />
    </div>
  )
}

