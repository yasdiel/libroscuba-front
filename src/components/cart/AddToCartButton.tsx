import { ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import type { Book } from "@/lib/api"
import { cn } from "@/lib/utils"

interface AddToCartButtonProps {
  book: Book
  size?: "sm" | "default"
  className?: string
  fullWidth?: boolean
}

export function AddToCartButton({
  book,
  size = "sm",
  className,
  fullWidth = true,
}: AddToCartButtonProps) {
  const { isInCart, addBook } = useCart()
  const inCart = isInCart(book.id)

  return (
    <Button
      type="button"
      size={size}
      variant={inCart ? "secondary" : "outline"}
      className={cn(fullWidth && "w-full", "gap-1.5", className)}
      disabled={inCart}
      onClick={(e) => {
        e.stopPropagation()
        addBook(book)
      }}
    >
      <ShoppingCart className="h-4 w-4" />
      {inCart ? "En el carrito" : "Agregar al carrito"}
    </Button>
  )
}
