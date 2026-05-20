import { Store } from "lucide-react"
import { cn } from "@/lib/utils"
import { bookListCoverUrl } from "@/lib/utils"

const sizeClasses = {
  sm: "h-10 w-10 rounded-xl text-base",
  md: "h-14 w-14 rounded-2xl text-2xl",
  lg: "h-20 w-20 rounded-2xl text-3xl",
} as const

interface StoreAvatarProps {
  nombreTienda: string
  fotoUrl?: string | null
  size?: keyof typeof sizeClasses
  className?: string
  /** Estilo sobre fondo oscuro (cabecera de tienda pública). */
  onDark?: boolean
}

export function StoreAvatar({
  nombreTienda,
  fotoUrl,
  size = "md",
  className,
  onDark = false,
}: StoreAvatarProps) {
  const initial = (nombreTienda.trim().charAt(0) || "?").toUpperCase()

  if (fotoUrl) {
    return (
      <div
        className={cn(
          "shrink-0 overflow-hidden bg-gray-100",
          sizeClasses[size],
          className
        )}
      >
        <img
          src={bookListCoverUrl(fotoUrl)}
          alt=""
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
        />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-center font-bold",
        sizeClasses[size],
        onDark
          ? "bg-white/15 text-white backdrop-blur"
          : "bg-brand-light text-brand",
        className
      )}
      aria-hidden
    >
      {initial || <Store className="h-1/2 w-1/2" />}
    </div>
  )
}
