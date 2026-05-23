import { useEffect, useState } from "react"
import { BookOpen } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"
import { LocationFilter } from "@/components/filters/LocationFilter"
import { MunicipiosEnvioSelect } from "@/components/filters/MunicipiosEnvioSelect"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PasswordInput } from "@/components/ui/password-input"
import { PhoneInput } from "@/components/ui/phone-input"
import { useAuth } from "@/context/AuthContext"
import { api, ApiError } from "@/lib/api"
import {
  formatPhoneForApi,
  PASSWORD_MIN_LENGTH,
  validateLocalPhone,
  validatePassword,
} from "@/lib/phone"

export function LoginPage() {
  const { user, loading: authLoading, login, register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.is_admin ? "/admin" : "/perfil", { replace: true })
    }
  }, [authLoading, user, navigate])
  const [mode, setMode] = useState<"login" | "register">("login")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [nombreTienda, setNombreTienda] = useState("")
  const [provincia, setProvincia] = useState("")
  const [municipio, setMunicipio] = useState("")
  const [municipiosEnvio, setMunicipiosEnvio] = useState<string[]>([])
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState("")
  const [errorAction, setErrorAction] = useState<null | {
    label: string
    targetMode: "login" | "register"
  }>(null)
  const [loading, setLoading] = useState(false)

  const switchMode = (next: "login" | "register") => {
    setMode(next)
    setError("")
    setErrorAction(null)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setErrorAction(null)

    const phoneError = validateLocalPhone(phone)
    const passwordError = validatePassword(password)
    if (phoneError || passwordError) {
      setError([phoneError, passwordError].filter(Boolean).join(". "))
      return
    }

    const whatsapp_number = formatPhoneForApi(phone)
    setLoading(true)
    try {
      if (mode === "login") {
        await login(whatsapp_number, password)
      } else {
        if (!accepted) {
          setError("Debes aceptar los términos y condiciones")
          setLoading(false)
          return
        }
        if (!nombreTienda.trim()) {
          setError("Ingresa el nombre de tu tienda")
          setLoading(false)
          return
        }
        if (!provincia || !municipio) {
          setError("Selecciona provincia y municipio")
          setLoading(false)
          return
        }
        await register({
          whatsapp_number,
          password,
          nombre_tienda: nombreTienda,
          provincia,
          municipio,
          municipios_envio: municipiosEnvio,
          accepted_terms: true,
        })
      }
      const me = await api.me()
      navigate(me.is_admin ? "/admin" : "/perfil")
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (mode === "login" && err.status === 404) {
          setErrorAction({ label: "Crear cuenta con este número", targetMode: "register" })
        } else if (mode === "register" && err.status === 409) {
          setErrorAction({ label: "Iniciar sesión con este número", targetMode: "login" })
        } else {
          setErrorAction(null)
        }
      } else {
        setError("Error de autenticación")
        setErrorAction(null)
      }
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || user) {
    return <p className="px-4 py-8 text-center text-gray-500">Cargando sesión...</p>
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-md mx-auto">
      <div className="mb-8 text-center">
        <BookOpen className="mx-auto h-10 w-10 text-brand mb-2" />
        <h1 className="text-2xl font-bold">LibrosCuba</h1>
        <p className="text-sm text-gray-500 mt-1">
          {mode === "login" ? "Accede a tu tienda" : "Crea tu tienda de libros físicos"}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="flex rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-3 text-sm font-medium min-h-12 ${
              mode === "login" ? "bg-white shadow text-brand" : "text-gray-600"
            }`}
            onClick={() => switchMode("login")}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-3 text-sm font-medium min-h-12 ${
              mode === "register" ? "bg-white shadow text-brand" : "text-gray-600"
            }`}
            onClick={() => switchMode("register")}
          >
            Registrarse
          </button>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone">Teléfono / WhatsApp</Label>
          <PhoneInput id="phone" value={phone} onChange={setPhone} />
          <p className="text-xs text-gray-500">8 dígitos después del +53</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Contraseña</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={PASSWORD_MIN_LENGTH}
          />
          <p className="text-xs text-gray-500">Mínimo {PASSWORD_MIN_LENGTH} caracteres</p>
        </div>

        {mode === "register" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="tienda">Nombre de tu tienda</Label>
              <Input
                id="tienda"
                value={nombreTienda}
                onChange={(e) => setNombreTienda(e.target.value)}
                required
              />
            </div>
            <LocationFilter
              required
              provincia={provincia}
              municipio={municipio}
              onProvinciaChange={setProvincia}
              onMunicipioChange={setMunicipio}
            />
            <MunicipiosEnvioSelect
              value={municipiosEnvio}
              onChange={setMunicipiosEnvio}
              excludeMunicipio={municipio}
            />
            <div className="flex gap-3 items-center">
              <Checkbox
                id="terms"
                checked={accepted}
                onCheckedChange={(v) => setAccepted(v === true)}
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer">
                Acepto los{" "}
                <Link
                  to="/terminos"
                  className="font-medium text-brand underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  Términos y Condiciones
                </Link>
              </label>
            </div>
          </>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-2">
            <p className="text-sm text-red-700">{error}</p>
            {errorAction && (
              <button
                type="button"
                onClick={() => switchMode(errorAction.targetMode)}
                className="text-sm font-semibold text-brand underline-offset-2 hover:underline"
              >
                {errorAction.label}
              </button>
            )}
          </div>
        )}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Procesando..." : mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 space-y-2">
        <Link to="/" className="block text-brand font-medium">
          Volver al inicio
        </Link>
      </p>
    </div>
  )
}