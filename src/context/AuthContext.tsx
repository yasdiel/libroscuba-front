import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { cacheClear } from "@/lib/cache"
import { api, ApiError, type User } from "@/lib/api"
import { authToken } from "@/lib/authToken"

interface AuthContextValue {
  user: User | null
  /** true mientras se restaura la sesión desde localStorage al abrir la app */
  loading: boolean
  login: (whatsapp_number: string, password: string) => Promise<void>
  register: (data: {
    password: string
    whatsapp_number: string
    provincia: string
    municipio: string
    nombre_tienda: string
    municipios_envio?: string[]
    accepted_terms: boolean
  }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function isAuthExpired(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 401 || err.status === 403)
}

async function fetchMeWithRetry(): Promise<User> {
  try {
    return await api.me()
  } catch (err) {
    if (isAuthExpired(err)) throw err
    // Reintento breve (p. ej. API en cold start de Render)
    await new Promise((r) => setTimeout(r, 1200))
    return await api.me()
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    if (!authToken.has()) {
      setUser(null)
      return
    }
    try {
      const me = await fetchMeWithRetry()
      setUser(me)
    } catch (err) {
      if (isAuthExpired(err)) {
        authToken.clear()
        setUser(null)
      } else {
        // Red caída o API lento: conservar token para el próximo intento
        setUser(null)
      }
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!authToken.has()) {
        if (!cancelled) setLoading(false)
        return
      }
      try {
        const me = await fetchMeWithRetry()
        if (!cancelled) setUser(me)
      } catch (err) {
        if (!cancelled) {
          if (isAuthExpired(err)) {
            authToken.clear()
          }
          setUser(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const login = async (whatsapp_number: string, password: string) => {
    const { access_token } = await api.login(whatsapp_number, password)
    authToken.set(access_token)
    cacheClear()
    await refreshUser()
  }

  const register = async (data: Parameters<AuthContextValue["register"]>[0]) => {
    const { access_token } = await api.register(data)
    authToken.set(access_token)
    cacheClear()
    await refreshUser()
  }

  const logout = () => {
    authToken.clear()
    cacheClear()
    setUser(null)
  }

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider")
  return ctx
}
