import { MapPin, ShoppingBag } from "lucide-react"
import { BookCover } from "@/components/books/BookCover"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { Book } from "@/lib/api"
import { bookListCoverUrl, cn, formatPrice, whatsappBuyLink } from "@/lib/utils"

interface BookCardProps {
  book: Book
  onClick?: () => void
  actions?: React.ReactNode
  className?: string
}

export function BookCard({ book, onClick, actions, className }: BookCardProps) {
  const buyLink = book.vendedor_whatsapp
    ? whatsappBuyLink(book.vendedor_whatsapp, book.titulo, book.autor)
    : null

  return (
    <Card
      className={cn("overflow-hidden transition-shadow active:shadow-md active:ring-1 active:ring-brand/20", className)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onClick()
            }
          : undefined
      }
    >
      <div className="aspect-[4/5] w-full overflow-hidden">
        <BookCover src={bookListCoverUrl(book.foto_url)} alt={book.titulo} />
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="truncate font-display text-base font-semibold text-gray-900">{book.titulo}</h3>
            <p className="truncate text-sm text-gray-500">{book.autor}</p>
          </div>
          <Badge variant={book.estado === "nuevo" ? "default" : "secondary"}>
            {book.estado === "nuevo" ? "Nuevo" : "Usado"}
          </Badge>
        </div>
        <p className="text-lg font-bold text-brand">{formatPrice(book.precio)}</p>
        <p className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">
            {book.municipio}, {book.provincia}
          </span>
        </p>
        {actions ? (
          <div className="flex gap-2 pt-1">{actions}</div>
        ) : (
          buyLink && (
            <Button asChild size="sm" className="w-full gap-1.5 mt-1">
              <a
                href={buyLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                <ShoppingBag className="h-4 w-4" />
                Comprar
              </a>
            </Button>
          )
        )}
      </div>
    </Card>
  )
}



