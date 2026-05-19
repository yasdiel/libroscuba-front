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
import { api, type User } from "@/lib/api"

interface AuthContextValue {
  user: User | null
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("lc_token")
    if (!token) {
      setUser(null)
      return
    }
    try {
      const me = await api.me()
      setUser(me)
    } catch {
      localStorage.removeItem("lc_token")
      setUser(null)
    }
  }, [])

  useEffect(() => {
    refreshUser().finally(() => setLoading(false))
  }, [refreshUser])

  const login = async (whatsapp_number: string, password: string) => {
    const { access_token } = await api.login(whatsapp_number, password)
    localStorage.setItem("lc_token", access_token)
    cacheClear()
    await refreshUser()
  }

  const register = async (data: Parameters<AuthContextValue["register"]>[0]) => {
    const { access_token } = await api.register(data)
    localStorage.setItem("lc_token", access_token)
    cacheClear()
    await refreshUser()
  }

  const logout = () => {
    localStorage.removeItem("lc_token")
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



