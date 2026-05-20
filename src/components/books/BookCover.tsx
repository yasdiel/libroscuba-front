import { useEffect, useRef, useState } from "react"
import { ImageOff, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface BookCoverProps {
  src: string
  alt: string
  className?: string
  /** Prioriza la carga de portadas visibles al entrar en pantalla. */
  eager?: boolean
}

export function BookCover({ src, alt, className, eager = false }: BookCoverProps) {
  const imgRef = useRef<HTMLImageElement>(null)
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading")

  useEffect(() => {
    setStatus("loading")
    const img = imgRef.current
    if (img?.complete && img.naturalWidth > 0) {
      setStatus("loaded")
    }
  }, [src])

  return (
    <div className={cn("relative h-full w-full bg-gray-100", className)}>
      {status === "loading" && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-gray-100"
          aria-hidden
        >
          <Loader2 className="h-7 w-7 animate-spin text-gray-300" />
        </div>
      )}
      {status === "error" && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-gray-100 text-gray-400"
          aria-hidden
        >
          <ImageOff className="h-7 w-7" />
          <span className="text-xs">Sin imagen</span>
        </div>
      )}
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        className="h-full w-full object-cover"
      />
    </div>
  )
}
