import { Link } from "react-router-dom"
import { BookOpen, Loader2, MessageCircle, ShoppingCart, Trash2 } from "lucide-react"
import { BookCover } from "@/components/books/BookCover"
import { CurrencySelect } from "@/components/currency/CurrencySelect"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useCart } from "@/context/CartContext"
import { useCurrency } from "@/context/CurrencyContext"
import { itemPriceInCurrency } from "@/lib/cart"
import { bookListCoverUrl, whatsappCartOrderLink } from "@/lib/utils"
import { storePath } from "@/lib/storeRoutes"

export function CartPage() {
  const { groups, count, syncing, hydrated, removeItem, setStorePaymentCurrency, syncCart } =
    useCart()
  const { formatPrice, rates } = useCurrency()

  return (
    <div className="pb-4">
      <header className="vintage-header rounded-b-3xl px-4 pb-6 pt-6">
        <div className="mb-1 flex items-center gap-2">
          <ShoppingCart className="h-7 w-7 text-paper/90" />
          <h1 className="font-display text-2xl font-bold tracking-tight">Tu carrito</h1>
        </div>
        <p className="text-sm text-paper/85">
          Pedidos separados por tienda. Elige en qué moneda pagar según lo que acepta cada
          vendedor.
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
              const waLines = group.items.map((item) => ({
                titulo: item.titulo,
                autor: item.autor,
                precio: itemPriceInCurrency(item, group.moneda_pago, rates),
                moneda: group.moneda_pago,
              }))
              const waLink = whatsappCartOrderLink(
                group.whatsapp,
                group.storeName,
                waLines,
                group.moneda_pago
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
                          {formatPrice(group.subtotal, group.moneda_pago)}
                        </p>
                      </div>
                    </div>

                    <div className="border-b border-gray-100 px-4 py-3">
                      <Label className="text-xs text-gray-600">Moneda de pago</Label>
                      <div className="mt-1.5">
                        <CurrencySelect
                          value={group.moneda_pago}
                          onChange={(code) => setStorePaymentCurrency(group.ownerId, code)}
                          allowed={group.monedas_aceptadas}
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">
                        Solo monedas aceptadas por los libros de esta tienda.
                      </p>
                    </div>

                    <ul className="divide-y divide-gray-100">
                      {group.items.map((item) => {
                        const converted = itemPriceInCurrency(item, group.moneda_pago, rates)
                        const showOriginal = item.moneda !== group.moneda_pago
                        return (
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
                                {formatPrice(converted, group.moneda_pago)}
                              </p>
                              {showOriginal && (
                                <p className="text-xs text-gray-400">
                                  Precio original: {formatPrice(item.precio, item.moneda)}
                                </p>
                              )}
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
                        )
                      })}
                    </ul>

                    <div className="border-t border-gray-100 bg-gray-50/80 px-4 py-4 space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Subtotal de esta tienda</span>
                        <span className="font-bold text-gray-900">
                          {formatPrice(group.subtotal, group.moneda_pago)}
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

            <p className="text-center text-xs text-gray-500">
              {count} {count === 1 ? "libro" : "libros"} · El pago y la entrega se acuerdan
              directamente con cada vendedor por WhatsApp.
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
