import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { api } from "@/lib/api"
import {
  BASE_CURRENCY,
  convertAmount,
  filterSupportedCurrencies,
  formatMoney,
  isSupportedCurrency,
  ratesMap,
  resolveBookDisplayPrice,
  SUPPORTED_CURRENCIES,
  VIEW_CURRENCY_STORAGE_KEY,
  type BookDisplayPrice,
  type BookPriceInput,
  type CurrencyInfo,
} from "@/lib/currency"

interface CurrencyContextValue {
  currencies: CurrencyInfo[]
  loading: boolean
  rates: Record<string, number>
  viewCurrency: string
  setViewCurrency: (code: string) => void
  formatPrice: (amount: number, currency: string) => string
  convert: (amount: number, from: string, to: string) => number
  labelFor: (code: string) => string
  bookDisplayPrice: (book: BookPriceInput) => BookDisplayPrice
}

const FALLBACK: CurrencyInfo[] = SUPPORTED_CURRENCIES.map((code) => ({
  code,
  label:
    code === "CUP"
      ? "Peso cubano (CUP)"
      : code === "USD"
        ? "Dólar (USD)"
        : code === "EUR"
          ? "Euro (EUR)"
          : "MLC",
  rate_cup: code === "CUP" ? 1 : 0,
}))

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

function loadViewCurrency(): string {
  try {
    const stored = localStorage.getItem(VIEW_CURRENCY_STORAGE_KEY)
    if (stored && isSupportedCurrency(stored)) return stored.toUpperCase()
  } catch {
    /* ignore */
  }
  return BASE_CURRENCY
}

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [viewCurrency, setViewCurrencyState] = useState(loadViewCurrency)

  const load = useCallback(async () => {
    try {
      const data = await api.currencies()
      if (data.currencies?.length) {
        const filtered = filterSupportedCurrencies(data.currencies)
        if (filtered.length) setCurrencies(filtered)
      }
    } catch {
      setCurrencies(FALLBACK)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const setViewCurrency = useCallback((code: string) => {
    const next = code.toUpperCase()
    if (!isSupportedCurrency(next)) return
    setViewCurrencyState(next)
    try {
      localStorage.setItem(VIEW_CURRENCY_STORAGE_KEY, next)
    } catch {
      /* ignore */
    }
  }, [])

  const rates = useMemo(() => ratesMap(currencies), [currencies])

  const labelFor = useCallback(
    (code: string) => currencies.find((c) => c.code === code)?.label ?? code,
    [currencies]
  )

  const bookDisplayPrice = useCallback(
    (book: BookPriceInput) => resolveBookDisplayPrice(book, viewCurrency, rates),
    [viewCurrency, rates]
  )

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currencies,
      loading,
      rates,
      viewCurrency,
      setViewCurrency,
      formatPrice: (amount, currency) => formatMoney(amount, currency),
      convert: (amount, from, to) => convertAmount(amount, from, to, rates),
      labelFor,
      bookDisplayPrice,
    }),
    [currencies, loading, rates, viewCurrency, setViewCurrency, labelFor, bookDisplayPrice]
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error("useCurrency debe usarse dentro de CurrencyProvider")
  return ctx
}
