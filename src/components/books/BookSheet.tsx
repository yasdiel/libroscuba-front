import { BookCover } from "@/components/books/BookCover"
import { StoreAvatar } from "@/components/stores/StoreAvatar"
import { ChevronRight, MapPin, ShoppingBag, Truck } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetBody,
  SheetCloseButton,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { Book } from "@/lib/api"
import { storePath } from "@/lib/storeRoutes"
import { formatPrice, whatsappBuyLink } from "@/lib/utils"

interface BookSheetProps {
  book: Book | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookSheet({ book, open, onOpenChange }: BookSheetProps) {
  const navigate = useNavigate()
  if (!book) return null
  const wa = book.vendedor_whatsapp
    ? whatsappBuyLink(book.vendedor_whatsapp, book.titulo, book.autor)
    : null

  const goToStore = () => {
    const slug = book.vendedor_tienda_slug
    if (!slug) return
    onOpenChange(false)
    navigate(storePath(slug))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetCloseButton />
        <SheetHeader>
          <SheetTitle className="pr-10">{book.titulo}</SheetTitle>
          <SheetDescription className="sr-only">
            Detalles del libro, precio, ubicación y opción de compra por WhatsApp.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="space-y-4 pb-8">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl">
            <BookCover src={book.foto_url} alt={book.titulo} priority />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{book.estado === "nuevo" ? "Nuevo" : "Usado"}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Autor</p>
            <p className="font-medium">{book.autor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Precio</p>
            <p className="text-2xl font-bold text-brand">{formatPrice(book.precio)}</p>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <span>
              {book.municipio}, {book.provincia}
            </span>
          </div>
          {book.descripcion && (
            <div>
              <p className="mb-1 text-sm text-gray-500">Descripción</p>
              <p className="text-sm leading-relaxed text-gray-700">{book.descripcion}</p>
            </div>
          )}

          {book.vendedor_nombre && book.vendedor_tienda_slug && (
            <button
              type="button"
              onClick={goToStore}
              className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100 active:bg-gray-200"
            >
              <StoreAvatar
                nombreTienda={book.vendedor_nombre}
                fotoUrl={book.vendedor_foto_tienda_url}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-brand">
                  Publicado por
                </p>
                <p className="truncate font-semibold text-gray-900">{book.vendedor_nombre}</p>
                <p className="text-xs text-gray-500">Ver tienda y catálogo</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
            </button>
          )}

          {book.vendedor_municipios_envio && book.vendedor_municipios_envio.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
                <Truck className="h-3.5 w-3.5 text-brand" />
                Envíos también a
              </p>
              <div className="flex flex-wrap gap-1.5">
                {book.vendedor_municipios_envio.map((m) => (
                  <Badge key={m} variant="secondary" className="text-xs">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {wa && (
            <Button className="w-full gap-2" size="lg" asChild>
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <ShoppingBag className="h-5 w-5" />
                Comprar
              </a>
            </Button>
          )}
        </SheetBody>
      </SheetContent>
    </Sheet>
  )
}
