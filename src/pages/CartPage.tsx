import { Link } from "react-router-dom"
import { BookOpen, Loader2, MessageCircle, ShoppingCart, Trash2 } from "lucide-react"
import { BookCover } from "@/components/books/BookCover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useCart } from "@/context/CartContext"
import { bookListCoverUrl, formatPrice, whatsappCartOrderLink } from "@/lib/utils"
import { storePath } from "@/lib/storeRoutes"

export function CartPage() {
  const { groups, count, syncing, hydrated, removeItem, syncCart } = useCart()

  const grandTotal = groups.reduce((sum, g) => sum + g.subtotal, 0)

  return (
    <div className="pb-4">
      <header className="vintage-header rounded-b-3xl px-4 pb-6 pt-6">
        <div className="mb-1 flex items-center gap-2">
          <ShoppingCart className="h-7 w-7 text-paper/90" />
          <h1 className="font-display text-2xl font-bold tracking-tight">Tu carrito</h1>
        </div>
        <p className="text-sm text-paper/85">
          Pedidos separados por tienda. Cada vendedor recibe su propio mensaje por WhatsApp.
        </p>
      </header>

      <section className="space-y-4 px-4 py-4">
        {syncing && !hydrated ? (
          <div className="flex items-center justify-center gap-2 py-12 text-sm text-gray-500">
            <Loader2 className="h-5 w-5 animate-spin text-brand" />
            Actualizando carrito...
          </div>
        ) : count === 0 ? (
          <div className="flex flex-col items-center gap-4 py-12 text-center">
            <BookOpen className="h-12 w-12 text-brand/60" />
            <p className="text-gray-600">Tu carrito está vacío.</p>
            <Button asChild>
              <Link to="/">Explorar libros</Link>
            </Button>
          </div>
        ) : (
          <>
            {groups.map((group) => {
              const waLink = whatsappCartOrderLink(
                group.whatsapp,
                group.storeName,
                group.items.map((i) => ({
                  titulo: i.titulo,
                  autor: i.autor,
                  precio: i.precio,
                }))
              )
              return (
                <Card key={group.ownerId} className="overflow-hidden border-gray-200 shadow-sm">
                  <CardContent className="p-0">
                    <div className="border-b border-gray-100 bg-brand-light/40 px-4 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          {group.tiendaSlug ? (
                            <Link
                              to={storePath(group.tiendaSlug)}
                              className="font-display text-base font-semibold text-brand hover:underline"
                            >
                              {group.storeName}
                            </Link>
                          ) : (
                            <p className="font-display text-base font-semibold text-gray-900">
                              {group.storeName}
                            </p>
                          )}
                          <p className="text-xs text-gray-500">
                            {group.items.length}{" "}
                            {group.items.length === 1 ? "libro" : "libros"}
                          </p>
                        </div>
                        <p className="shrink-0 text-lg font-bold text-brand">
                          {formatPrice(group.subtotal)}
                        </p>
                      </div>
                    </div>

                    <ul className="divide-y divide-gray-100">
                      {group.items.map((item) => (
                        <li key={item.bookId} className="flex gap-3 px-4 py-3">
                          <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                            <BookCover
                              src={bookListCoverUrl(item.foto_url)}
                              alt={item.titulo}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-900 line-clamp-2">
                                  {item.titulo}
                                </p>
                                <p className="text-sm text-gray-500">{item.autor}</p>
                              </div>
                              <Badge
                                variant={item.estado === "nuevo" ? "default" : "secondary"}
                                className="shrink-0"
                              >
                                {item.estado === "nuevo" ? "Nuevo" : "Usado"}
                              </Badge>
                            </div>
                            <p className="mt-1 text-sm font-medium text-brand">
                              {formatPrice(item.precio)}
                            </p>
                            <p className="text-xs text-gray-400">
                              {item.municipio}, {item.provincia}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            className="shrink-0 text-gray-400 hover:text-red-600"
                            aria-label={`Quitar ${item.titulo}`}
                            onClick={() => removeItem(item.bookId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </li>
                      ))}
                    </ul>

                    <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Subtotal de esta tienda</span>
                        <span className="font-bold text-gray-900">
                          {formatPrice(group.subtotal)}
                        </span>
                      </div>
                      {waLink ? (
                        <Button asChild className="w-full gap-2" size="lg">
                          <a href={waLink} target="_blank" rel="noopener noreferrer">
                            <MessageCircle className="h-5 w-5" />
                            Comprar por WhatsApp
                          </a>
                        </Button>
                      ) : (
                        <p className="text-center text-xs text-red-600">
                          Sin WhatsApp de contacto para esta tienda.
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}

            <Card className="border-brand/20 bg-brand-light/30">
              <CardContent className="flex items-center justify-between p-4">
                <span className="font-display font-semibold text-gray-900">
                  Total ({count} {count === 1 ? "libro" : "libros"})
                </span>
                <span className="text-xl font-bold text-brand">{formatPrice(grandTotal)}</span>
              </CardContent>
            </Card>

            <p className="text-center text-xs text-gray-500">
              El pago y la entrega se acuerdan directamente con cada vendedor por WhatsApp.
            </p>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={syncing}
              onClick={() => void syncCart()}
            >
              {syncing ? "Actualizando..." : "Actualizar disponibilidad"}
            </Button>
          </>
        )}
      </section>
    </div>
  )
}
