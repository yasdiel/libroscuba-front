import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"

function Bone({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-paper-dark", className)} />
}

export const bookCardGridClass =
  "grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"

interface BookCardSkeletonProps {
  className?: string
  /** Si es false, omite el hueco del botón (p. ej. perfil con acciones distintas). */
  showButton?: boolean
}

export function BookCardSkeleton({
  className,
  showButton = true,
}: BookCardSkeletonProps) {
  return (
    <Card className={cn("overflow-hidden", className)} aria-hidden>
      <Bone className="aspect-[4/5] w-full rounded-none" />
      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1 space-y-2">
            <Bone className="h-4 w-[85%]" />
            <Bone className="h-3.5 w-[60%]" />
          </div>
          <Bone className="h-5 w-12 shrink-0 rounded-full" />
        </div>
        <Bone className="h-5 w-20" />
        <Bone className="h-3 w-[75%]" />
        {showButton && <Bone className="mt-1 h-10 w-full rounded-xl" />}
      </div>
    </Card>
  )
}

interface BookCardSkeletonGridProps {
  count: number
  className?: string
  showButton?: boolean
}

export function BookCardSkeletonGrid({
  count,
  className,
  showButton = true,
}: BookCardSkeletonGridProps) {
  return (
    <div
      className={cn(bookCardGridClass, className)}
      role="status"
      aria-live="polite"
      aria-label="Cargando libros"
    >
      {Array.from({ length: count }, (_, i) => (
        <BookCardSkeleton key={i} showButton={showButton} />
      ))}
    </div>
  )
}
