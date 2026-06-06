export const BASE_CURRENCY = "CUP"

/** Monedas habilitadas en la app (tasas vía elTOQUE). */
export const SUPPORTED_CURRENCIES = ["CUP", "USD", "EUR", "MLC"] as const
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]

export function isSupportedCurrency(code: string): code is SupportedCurrency {
  return SUPPORTED_CURRENCIES.includes(code.toUpperCase() as SupportedCurrency)
}

export function filterSupportedCurrencies(currencies: CurrencyInfo[]): CurrencyInfo[] {
  const allowed = new Set<string>(SUPPORTED_CURRENCIES)
  return currencies.filter((c) => allowed.has(c.code))
}

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

export interface BookPriceInput {
  precio: number
  moneda?: string
  monedas_aceptadas?: string[]
}

export interface BookDisplayPrice {
  amount: number
  currency: string
  converted: boolean
  originalAmount: number
  originalCurrency: string
}

export function bookAcceptedCurrencies(book: BookPriceInput): string[] {
  const original = (book.moneda || BASE_CURRENCY).toUpperCase()
  const raw = book.monedas_aceptadas?.length ? book.monedas_aceptadas : [original]
  const seen = new Set<string>()
  const list: string[] = []
  for (const code of raw) {
    const upper = code.toUpperCase()
    if (!seen.has(upper)) {
      seen.add(upper)
      list.push(upper)
    }
  }
  if (!seen.has(original)) list.unshift(original)
  return list
}

/** Precio a mostrar: convierte solo si el libro acepta la moneda elegida. */
export function resolveBookDisplayPrice(
  book: BookPriceInput,
  viewCurrency: string,
  rates: Record<string, number>
): BookDisplayPrice {
  const originalCurrency = (book.moneda || BASE_CURRENCY).toUpperCase()
  const accepted = bookAcceptedCurrencies(book)
  const view = viewCurrency.toUpperCase()

  if (view === originalCurrency) {
    return {
      amount: book.precio,
      currency: originalCurrency,
      converted: false,
      originalAmount: book.precio,
      originalCurrency,
    }
  }

  if (accepted.includes(view)) {
    return {
      amount: convertAmount(book.precio, originalCurrency, view, rates),
      currency: view,
      converted: true,
      originalAmount: book.precio,
      originalCurrency,
    }
  }

  return {
    amount: book.precio,
    currency: originalCurrency,
    converted: false,
    originalAmount: book.precio,
    originalCurrency,
  }
}

export const VIEW_CURRENCY_STORAGE_KEY = "libroscuba_view_currency"
