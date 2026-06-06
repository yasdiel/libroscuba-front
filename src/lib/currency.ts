export const BASE_CURRENCY = "CUP"

export interface CurrencyInfo {
  code: string
  label: string
  rate_cup: number
}

export interface CurrenciesResponse {
  base: string
  date?: string | null
  time?: string | null
  currencies: CurrencyInfo[]
}

export function ratesMap(currencies: CurrencyInfo[]): Record<string, number> {
  const map: Record<string, number> = {}
  for (const c of currencies) map[c.code] = c.rate_cup
  return map
}

export function convertAmount(
  amount: number,
  from: string,
  to: string,
  rates: Record<string, number>
): number {
  const src = from.toUpperCase()
  const dst = to.toUpperCase()
  if (src === dst) return amount
  const fromRate = rates[src]
  const toRate = rates[dst]
  if (!fromRate || !toRate) return amount
  const cup = src === BASE_CURRENCY ? amount : amount * fromRate
  return dst === BASE_CURRENCY ? cup : cup / toRate
}

export function formatMoney(amount: number, currency: string): string {
  const code = currency.toUpperCase()
  const rounded = code === BASE_CURRENCY ? Math.round(amount) : Math.round(amount * 100) / 100
  return `${rounded.toLocaleString("es-CU")} ${code}`
}
