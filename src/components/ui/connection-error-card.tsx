import { RefreshCw, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ConnectionErrorCardProps {
  onRetry: () => void
  retrying?: boolean
  title?: string
  description?: string
  className?: string
}

export function ConnectionErrorCard({
  onRetry,
  retrying = false,
  title = "Error de conexión",
  description = "No pudimos cargar los datos. Comprueba tu conexión a internet e inténtalo de nuevo.",
  className,
}: ConnectionErrorCardProps) {
  return (
    <Card className={cn("border-gray-200 bg-white/90 shadow-sm", className)}>
      <CardContent className="flex flex-col items-center px-6 py-10 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-light">
          <WifiOff className="h-7 w-7 text-brand" aria-hidden />
        </div>
        <h3 className="font-display text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 max-w-sm text-sm text-gray-600">{description}</p>
        <Button
          type="button"
          className="mt-5 gap-2"
          onClick={onRetry}
          disabled={retrying}
        >
          <RefreshCw className={cn("h-4 w-4", retrying && "animate-spin")} aria-hidden />
          {retrying ? "Reintentando..." : "Intentar de nuevo"}
        </Button>
      </CardContent>
    </Card>
  )
}
