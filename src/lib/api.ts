import { env } from "@/lib/env"

const API_URL = env.apiUrl

export type EstadoLibro = "nuevo" | "usado"

export interface User {
  id: string
  whatsapp_number: string
  provincia: string
  municipio: string
  nombre_tienda: string
  municipios_envio: string[]
  is_admin: boolean
}

export interface Book {
  id: string
  owner_id: string
  titulo: string
  autor: string
  precio: number
  foto_url: string
  descripcion?: string | null
  estado: EstadoLibro
  provincia: string
  municipio: string
  fecha_creacion: string
  vendedor_nombre?: string | null
  vendedor_whatsapp?: string | null
  vendedor_municipios_envio?: string[]
  owner_whatsapp?: string | null
}

export interface Store {
  id: string
  nombre_tienda: string
  provincia: string
  municipio: string
  whatsapp_number: string
  municipios_envio: string[]
  book_count: number
}

export interface AdminStats {
  total_libros_activos: number
  total_tiendas: number
}

export interface LocationsResponse {
  provincias: string[]
  municipios_por_provincia: Record<string, string[]>
  total_municipios: number
}

function isLocationsMap(value: unknown): value is Record<string, string[]> {
  return (
    !!value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !("municipios_por_provincia" in value)
  )
}

/** Normaliza la respuesta de /api/locations (formato nuevo o legado). */
export function parseLocationsMap(
  data: LocationsResponse | Record<string, string[]>
): Record<string, string[]> {
  if (data && typeof data === "object" && "municipios_por_provincia" in data) {
    const wrapped = data as LocationsResponse
    return wrapped.municipios_por_provincia ?? {}
  }
  if (isLocationsMap(data)) {
    return data
  }
  return {}
}

class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

const VALIDATION_FIELD_LABELS: Record<string, string> = {
  whatsapp_number: "Teléfono",
  password: "Contraseña",
  nombre_tienda: "Nombre de tienda",
  provincia: "Provincia",
  municipio: "Municipio",
  accepted_terms: "Términos y condiciones",
  email: "Email (obsoleto — reinicia el backend)",
}

function formatApiErrorDetail(detail: unknown): string {
  if (typeof detail === "string") return detail
  if (!Array.isArray(detail)) return "Error en la solicitud"
  return detail
    .map((item: { loc?: (string | number)[]; msg?: string }) => {
      const field = item.loc?.[item.loc.length - 1]
      const label =
        typeof field === "string" ? VALIDATION_FIELD_LABELS[field] ?? field : "Campo"
      return `${label}: ${item.msg ?? "inválido"}`
    })
    .join(". ")
}

function getToken(): string | null {
  return localStorage.getItem("lc_token")
}

const REQUEST_TIMEOUT_MS = 15_000

async function request<T>(
  path: string,
  options: RequestInit = {},
  auth = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  let res: Response
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError(
        "El servidor tardó demasiado en responder. Comprueba que el backend y MongoDB estén en ejecución.",
        0
      )
    }
    if (!API_URL) {
      throw new ApiError("VITE_API_URL no está configurada en el archivo .env", 0)
    }
    throw new ApiError(
      `No se pudo conectar con el API (${API_URL}). ¿Está el backend en marcha?`,
      0
    )
  } finally {
    clearTimeout(timeoutId)
  }
  if (!res.ok) {
    let detail = "Error en la solicitud"
    try {
      const body = await res.json()
      detail = body.detail ?? (typeof body === "string" ? body : detail)
      detail = formatApiErrorDetail(detail)
    } catch {
      /* ignore */
    }
    throw new ApiError(String(detail), res.status)
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  health: () => request<{ status: string }>("/api/health"),
  locations: () =>
    request<LocationsResponse | Record<string, string[]>>("/api/locations"),
  login: (whatsapp_number: string, password: string) =>
    request<{ access_token: string }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ whatsapp_number, password }),
    }),
  register: (data: {
    password: string
    whatsapp_number: string
    provincia: string
    municipio: string
    nombre_tienda: string
    municipios_envio?: string[]
    accepted_terms: boolean
  }) =>
    request<{ access_token: string }>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  me: () => request<User>("/api/auth/me", {}, true),
  books: (params?: {
    provincia?: string
    municipio?: string
    q?: string
    skip?: number
    limit?: number
  }) => {
    const sp = new URLSearchParams()
    if (params?.provincia) sp.set("provincia", params.provincia)
    if (params?.municipio) sp.set("municipio", params.municipio)
    if (params?.q) sp.set("q", params.q)
    if (params?.skip) sp.set("skip", String(params.skip))
    if (params?.limit) sp.set("limit", String(params.limit))
    const qs = sp.toString()
    return request<Book[]>(`/api/books${qs ? `?${qs}` : ""}`)
  },
  book: (id: string) => request<Book>(`/api/books/${id}`),
  createBook: (data: Omit<Book, "id" | "owner_id" | "fecha_creacion">) =>
    request<Book>("/api/books", { method: "POST", body: JSON.stringify(data) }, true),
  updateBook: (id: string, data: Partial<Book>) =>
    request<Book>(`/api/books/${id}`, { method: "PUT", body: JSON.stringify(data) }, true),
  deleteBook: (id: string) =>
    request<void>(`/api/books/${id}`, { method: "DELETE" }, true),
  myBooks: () => request<Book[]>("/api/users/me/books", {}, true),
  store: (id: string) => request<Store>(`/api/users/stores/${id}`),
  storeBooks: (id: string, q?: string) =>
    request<Book[]>(
      `/api/users/stores/${id}/books${q ? `?q=${encodeURIComponent(q)}` : ""}`
    ),
  updateProfile: (data: Partial<User>) =>
    request<User>("/api/users/me", { method: "PUT", body: JSON.stringify(data) }, true),
  uploadSignature: () =>
    request<{
      signature: string
      timestamp: number
      api_key: string
      cloud_name: string
      folder: string
    }>("/api/upload/signature", {}, true),
  adminStats: () => request<AdminStats>("/api/admin/stats", {}, true),
  adminBooks: (q?: string) =>
    request<Book[]>(`/api/admin/books${q ? `?q=${encodeURIComponent(q)}` : ""}`, {}, true),
  adminStores: (q?: string) =>
    request<Store[]>(`/api/admin/stores${q ? `?q=${encodeURIComponent(q)}` : ""}`, {}, true),
  adminDeleteBook: (id: string) =>
    request<void>(`/api/admin/books/${id}`, { method: "DELETE" }, true),
  adminDeleteStore: (id: string) =>
    request<void>(`/api/admin/stores/${id}`, { method: "DELETE" }, true),
}

export { ApiError }
