import { cn } from "@/lib/utils"

interface ElToqueRateNoticeProps {
  className?: string
}

export function ElToqueRateNotice({ className }: ElToqueRateNoticeProps) {
  return (
    <p className={cn("text-xs leading-relaxed text-gray-500", className)}>
      Las conversiones de moneda se calculan según la tasa oficial de{" "}
      <a
        href="https://eltoque.com"
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-brand underline-offset-2 hover:underline"
      >
        elTOQUE
      </a>
      . Solo se convierte un precio si el vendedor acepta esa moneda.
    </p>
  )
}
