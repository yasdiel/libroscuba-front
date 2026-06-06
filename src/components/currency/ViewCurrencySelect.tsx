import { Coins } from "lucide-react"
import { CurrencySelect } from "@/components/currency/CurrencySelect"
import { Label } from "@/components/ui/label"
import { useCurrency } from "@/context/CurrencyContext"

interface ViewCurrencySelectProps {
  className?: string
  label?: string
  hint?: string
}

export function ViewCurrencySelect({
  className,
  label = "Ver precios en",
  hint,
}: ViewCurrencySelectProps) {
  const { viewCurrency, setViewCurrency } = useCurrency()

  return (
    <div className={className}>
      <Label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-600">
        <Coins className="h-3.5 w-3.5 text-brand" />
        {label}
      </Label>
      <CurrencySelect value={viewCurrency} onChange={setViewCurrency} />
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  )
}
