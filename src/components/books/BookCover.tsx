import { cn } from "@/lib/utils"

interface BookCoverProps {
  src: string
  alt: string
  className?: string
  /** Detalle (sheet): carga la portada con prioridad normal. */
  priority?: boolean
}

/** Portada pasiva: la tarjeta muestra título/precio al instante; la imagen llega después. */
export function BookCover({ src, alt, className, priority = false }: BookCoverProps) {
  return (
    <div className={cn("relative h-full w-full bg-gray-200", className)}>
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "auto" : "low"}
        className="h-full w-full object-cover"
      />
    </div>
  )
}
