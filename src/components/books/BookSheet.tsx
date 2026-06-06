import { useState } from "react"
import { AddToCartButton } from "@/components/cart/AddToCartButton"
import { BookCover } from "@/components/books/BookCover"
import { ReportBookDialog } from "@/components/books/ReportBookDialog"
import { StoreAvatar } from "@/components/stores/StoreAvatar"
import { useAuth } from "@/context/AuthContext"
import { ChevronRight, Flag, MapPin, ShoppingBag, Truck } from "lucide-react"
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
import { api, cacheKeys, type Book } from "@/lib/api"
import { useCachedQuery } from "@/lib/useCachedQuery"
import { storePath } from "@/lib/storeRoutes"
import { formatPrice, whatsappBuyLink } from "@/lib/utils"

const BOOK_DETAIL_TTL_MS = 60_000

interface BookSheetProps {
  book: Book | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BookSheet({ book, open, onOpenChange }: BookSheetProps) {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [reportOpen, setReportOpen] = useState(false)

  const { data: detailBook } = useCachedQuery<Book>({
    key: open && book ? cacheKeys.book(book.id) : null,
    fetcher: () => api.book(book!.id),
    ttlMs: BOOK_DETAIL_TTL_MS,
    enabled: open && !!book,
  })

  if (!book) return null

  // El listado no trae descripción; al abrir el sheet pedimos el libro completo.
  const displayBook = detailBook ?? book

  const canReport = !user || user.id !== displayBook.owner_id
  const wa = displayBook.vendedor_whatsapp
    ? whatsappBuyLink(displayBook.vendedor_whatsapp, displayBook.titulo, displayBook.autor)
    : null

  const goToStore = () => {
    const slug = displayBook.vendedor_tienda_slug
    if (!slug) return
    onOpenChange(false)
    navigate(storePath(slug))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetCloseButton />
        <SheetHeader>
          <SheetTitle className="pr-10">{displayBook.titulo}</SheetTitle>
          <SheetDescription className="sr-only">
            Detalles del libro, precio, ubicación y opción de compra por WhatsApp.
          </SheetDescription>
        </SheetHeader>
        <SheetBody className="space-y-4 pb-8">
          <div className="aspect-[4/3] overflow-hidden rounded-2xl">
            <BookCover src={displayBook.foto_url} alt={displayBook.titulo} priority />
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>{displayBook.estado === "nuevo" ? "Nuevo" : "Usado"}</Badge>
          </div>
          <div>
            <p className="text-sm text-gray-500">Autor</p>
            <p className="font-medium">{displayBook.autor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Precio</p>
            <p className="text-2xl font-bold text-brand">
              {formatPrice(displayBook.precio, displayBook.moneda || "CUP")}
            </p>
            {displayBook.monedas_aceptadas?.length > 1 && (
              <p className="mt-1 text-xs text-gray-500">
                También acepta:{" "}
                {displayBook.monedas_aceptadas
                  .filter((m) => m !== (displayBook.moneda || "CUP"))
                  .join(", ")}
              </p>
            )}
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
            <span>
              {displayBook.municipio}, {displayBook.provincia}
            </span>
          </div>
          {displayBook.descripcion?.trim() ? (
            <div>
              <p className="mb-1 text-sm text-gray-500">Descripción</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                {displayBook.descripcion.trim()}
              </p>
            </div>
          ) : null}

          {displayBook.vendedor_nombre && displayBook.vendedor_tienda_slug && (
            <button
              type="button"
              onClick={goToStore}
              className="flex w-full items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 text-left transition-colors hover:bg-gray-100 active:bg-gray-200"
            >
              <StoreAvatar
                nombreTienda={displayBook.vendedor_nombre}
                fotoUrl={displayBook.vendedor_foto_tienda_url}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-brand">
                  Publicado por
                </p>
                <p className="truncate font-semibold text-gray-900">{displayBook.vendedor_nombre}</p>
                <p className="text-xs text-gray-500">Ver tienda y catálogo</p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-gray-400" />
            </button>
          )}

          {displayBook.vendedor_municipios_envio &&
            displayBook.vendedor_municipios_envio.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-3">
              <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-600">
                <Truck className="h-3.5 w-3.5 text-brand" />
                Envíos también a
              </p>
              <div className="flex flex-wrap gap-1.5">
                {displayBook.vendedor_municipios_envio.map((m) => (
                  <Badge key={m} variant="secondary" className="text-xs">
                    {m}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <AddToCartButton book={displayBook} size="default" />

          {wa && (
            <Button className="w-full gap-2" size="lg" asChild>
              <a href={wa} target="_blank" rel="noopener noreferrer">
                <ShoppingBag className="h-5 w-5" />
                Comprar
              </a>
            </Button>
          )}

          {canReport && (
            <Button
              type="button"
              variant="secondary"
              className="w-full gap-2"
              onClick={() => setReportOpen(true)}
            >
              <Flag className="h-4 w-4" />
              Reportar publicación
            </Button>
          )}
        </SheetBody>
      </SheetContent>
      <ReportBookDialog
        bookId={displayBook.id}
        bookTitle={displayBook.titulo}
        open={reportOpen}
        onOpenChange={setReportOpen}
      />
    </Sheet>
  )
}
