import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useCurrency } from "@/context/CurrencyContext"

interface CurrencySelectProps {
  value: string
  onChange: (code: string) => void
  allowed?: string[]
  placeholder?: string
}

export function CurrencySelect({
  value,
  onChange,
  allowed,
  placeholder = "Moneda",
}: CurrencySelectProps) {
  const { currencies, loading } = useCurrency()
  const options = allowed
    ? currencies.filter((c) => allowed.includes(c.code))
    : currencies

  return (
    <Select value={value} onValueChange={onChange} disabled={loading || options.length === 0}>
      <SelectTrigger>
        <SelectValue placeholder={loading ? "Cargando..." : placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
