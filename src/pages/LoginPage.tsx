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

const OTP_RESEND_SECONDS = 60

function validateEmail(value: string): string | null {
  const v = value.trim()
  if (!v) return "Ingresa tu correo electrónico"
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return "Correo electrónico inválido"
  return null
}

export function LoginPage() {
  const { user, loading: authLoading, login, sendRegisterOtp, register } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!authLoading && user) {
      navigate(user.is_admin ? "/admin" : "/perfil", { replace: true })
    }
  }, [authLoading, user, navigate])

  const [mode, setMode] = useState<"login" | "register">("login")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [otpCooldown, setOtpCooldown] = useState(0)
  const [password, setPassword] = useState("")
  const [nombreTienda, setNombreTienda] = useState("")
  const [provincia, setProvincia] = useState("")
  const [municipio, setMunicipio] = useState("")
  const [municipiosEnvio, setMunicipiosEnvio] = useState<string[]>([])
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState("")
  const [errorAction, setErrorAction] = useState<null | {
    label: string
    targetMode?: "login" | "register"
    onClick?: () => void
  }>(null)
  const [loading, setLoading] = useState(false)
  const [sendingOtp, setSendingOtp] = useState(false)

  useEffect(() => {
    if (otpCooldown <= 0) return
    const t = setInterval(() => setOtpCooldown((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [otpCooldown])

  const switchMode = (next: "login" | "register") => {
    setMode(next)
    setError("")
    setErrorAction(null)
    setOtpSent(false)
    setOtp("")
    setOtpCooldown(0)
  }

  const handleSendOtp = async () => {
    setError("")
    setErrorAction(null)
    const emailError = validateEmail(email)
    if (emailError) {
      setError(emailError)
      return
    }
    setSendingOtp(true)
    try {
      await sendRegisterOtp(email)
      setOtpSent(true)
      setOtpCooldown(OTP_RESEND_SECONDS)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        if (err.status === 409) {
          setErrorAction({ label: "Iniciar sesión", targetMode: "login" })
        }
      } else {
        setError("No se pudo enviar el código. Intenta de nuevo.")
      }
    } finally {
      setSendingOtp(false)
    }
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
        const emailError = validateEmail(email)
        if (emailError) {
          setError(emailError)
          setLoading(false)
          return
        }
        if (!otpSent) {
          setError("Primero envía el código de verificación a tu correo")
          setLoading(false)
          return
        }
        if (!/^\d{6}$/.test(otp.trim())) {
          setError("Ingresa el código de 6 dígitos que recibiste por correo")
          setLoading(false)
          return
        }
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
          email,
          otp,
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
          setErrorAction({ label: "Iniciar sesión", targetMode: "login" })
        } else if (mode === "register" && err.status === 400 && otpSent) {
          setErrorAction({
            label: "Reenviar código al correo",
            onClick: () => void handleSendOtp(),
          })
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
        <BookOpen className="mx-auto mb-2 h-10 w-10 text-brand" />
        <h1 className="font-display text-2xl font-bold text-gray-900">LibrosCuba</h1>
        <p className="text-sm text-gray-500 mt-1">
          {mode === "login" ? "Accede a tu tienda" : "Crea tu tienda de libros físicos"}
        </p>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="flex rounded-lg border border-gray-200 bg-paper-dark p-1">
          <button
            type="button"
            className={`flex-1 rounded-lg py-3 text-sm font-medium min-h-12 ${
              mode === "login" ? "bg-paper text-brand shadow-sm" : "text-gray-600"
            }`}
            onClick={() => switchMode("login")}
          >
            Entrar
          </button>
          <button
            type="button"
            className={`flex-1 rounded-lg py-3 text-sm font-medium min-h-12 ${
              mode === "register" ? "bg-paper text-brand shadow-sm" : "text-gray-600"
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

        {mode === "register" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  setOtpSent(false)
                  setOtp("")
                }}
                required
                placeholder="tu@correo.com"
              />
              <p className="text-xs text-gray-500">
                Te enviaremos un código de 6 dígitos (válido 5 minutos).
              </p>
            </div>

            <Button
              type="button"
              variant="secondary"
              className="w-full"
              disabled={sendingOtp || otpCooldown > 0}
              onClick={() => void handleSendOtp()}
            >
              {sendingOtp
                ? "Enviando código..."
                : otpCooldown > 0
                  ? `Reenviar código (${otpCooldown}s)`
                  : otpSent
                    ? "Reenviar código"
                    : "Enviar código de verificación"}
            </Button>

            {otpSent && (
              <div className="space-y-1.5">
                <Label htmlFor="otp">Código de verificación</Label>
                <Input
                  id="otp"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="text-center text-lg tracking-[0.35em] font-mono"
                  required
                />
              </div>
            )}
          </>
        )}

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
                minLength={2}
                maxLength={80}
              />
              <p className="text-xs text-gray-500">
                Debe ser único: será el enlace público de tu tienda (ej. libreria-centro).
              </p>
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
                onClick={() => {
                  if (errorAction.onClick) {
                    errorAction.onClick()
                  } else if (errorAction.targetMode) {
                    switchMode(errorAction.targetMode)
                  }
                }}
                className="text-sm font-semibold text-brand underline-offset-2 hover:underline"
              >
                {errorAction.label}
              </button>
            )}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={loading || (mode === "register" && (!otpSent || otp.length !== 6))}
        >
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
