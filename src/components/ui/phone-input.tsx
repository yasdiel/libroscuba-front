import { Input } from "@/components/ui/input"
import { CUBA_PREFIX, stripPhoneDigits } from "@/lib/phone"
import { cn } from "@/lib/utils"

interface PhoneInputProps {
  id?: string
  value: string
  onChange: (digits: string) => void
  className?: string
  disabled?: boolean
}

export function PhoneInput({ id, value, onChange, className, disabled }: PhoneInputProps) {
  return (
    <div className={cn("flex", className)}>
      <span
        className="inline-flex h-12 shrink-0 items-center rounded-l-xl border border-r-0 border-gray-200 bg-gray-100 px-3 text-sm font-medium text-gray-600"
        aria-hidden
      >
        {CUBA_PREFIX}
      </span>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        pattern="[0-9]*"
        maxLength={8}
        placeholder="55512345"
        className="rounded-l-none rounded-r-xl"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(stripPhoneDigits(e.target.value))}
      />
    </div>
  )
}
