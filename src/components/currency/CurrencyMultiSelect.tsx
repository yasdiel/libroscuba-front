import { Badge } from "@/components/ui/badge"
import { useCurrency } from "@/context/CurrencyContext"
import { cn } from "@/lib/utils"

interface CurrencyMultiSelectProps {
  value: string[]
  onChange: (codes: string[]) => void
  allowed?: string[]
  className?: string
  hint?: string
}

export function CurrencyMultiSelect({
  value,
  onChange,
  allowed,
  className,
  hint,
}: CurrencyMultiSelectProps) {
  const { currencies, loading } = useCurrency()
  const options = allowed
    ? currencies.filter((c) => allowed.includes(c.code))
    : currencies

  const toggle = (code: string) => {
    if (value.includes(code)) {
      if (value.length === 1) return
      onChange(value.filter((c) => c !== code))
      return
    }
    onChange([...value, code])
  }

  if (loading) {
    return <p className="text-xs text-gray-500">Cargando monedas...</p>
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex flex-wrap gap-2">
        {options.map((c) => {
          const active = value.includes(c.code)
          return (
            <button
              key={c.code}
              type="button"
              onClick={() => toggle(c.code)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors min-h-10",
                active
                  ? "border-brand bg-brand text-paper"
                  : "border-gray-200 bg-white text-gray-700 hover:border-brand/40"
              )}
            >
              {c.code}
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((code) => (
          <Badge key={code} variant="secondary">
            {options.find((c) => c.code === code)?.label ?? code}
          </Badge>
        ))}
      </div>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
