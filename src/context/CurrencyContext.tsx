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
  formatMoney,
  ratesMap,
  type CurrencyInfo,
} from "@/lib/currency"

interface CurrencyContextValue {
  currencies: CurrencyInfo[]
  loading: boolean
  rates: Record<string, number>
  formatPrice: (amount: number, currency: string) => string
  convert: (amount: number, from: string, to: string) => number
  labelFor: (code: string) => string
}

const FALLBACK: CurrencyInfo[] = [
  { code: BASE_CURRENCY, label: "Peso cubano (CUP)", rate_cup: 1 },
]

const CurrencyContext = createContext<CurrencyContextValue | null>(null)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currencies, setCurrencies] = useState<CurrencyInfo[]>(FALLBACK)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const data = await api.currencies()
      if (data.currencies?.length) setCurrencies(data.currencies)
    } catch {
      setCurrencies(FALLBACK)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  const rates = useMemo(() => ratesMap(currencies), [currencies])

  const labelFor = useCallback(
    (code: string) => currencies.find((c) => c.code === code)?.label ?? code,
    [currencies]
  )

  const value = useMemo<CurrencyContextValue>(
    () => ({
      currencies,
      loading,
      rates,
      formatPrice: (amount, currency) => formatMoney(amount, currency),
      convert: (amount, from, to) => convertAmount(amount, from, to, rates),
      labelFor,
    }),
    [currencies, loading, rates, labelFor]
  )

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error("useCurrency debe usarse dentro de CurrencyProvider")
  return ctx
}
