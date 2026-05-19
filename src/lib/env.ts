function trimEnv(value: string | undefined): string {
  return value?.trim() ?? ""
}

function stripTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "")
}

const apiUrl = stripTrailingSlash(trimEnv(import.meta.env.VITE_API_URL))
const cloudinaryCloudName = trimEnv(import.meta.env.VITE_CLOUDINARY_CLOUD_NAME)
const cloudinaryUploadPreset = trimEnv(import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)

if (import.meta.env.DEV && !apiUrl) {
  console.error(
    "[LibrosCuba] VITE_API_URL no está definida. Copia .env.example a .env y reinicia el servidor de desarrollo."
  )
}

if (import.meta.env.PROD && !apiUrl) {
  throw new Error(
    "VITE_API_URL es obligatoria en producción. Defínela en .env.production o en las variables del entorno de build."
  )
}

export const env = {
  apiUrl,
  cloudinaryCloudName,
  cloudinaryUploadPreset,
  hasCloudinaryUpload: Boolean(cloudinaryCloudName && cloudinaryUploadPreset),
} as const
