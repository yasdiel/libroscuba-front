import { api } from "@/lib/api"
import { env } from "@/lib/env"

const MAX_BYTES = 8 * 1024 * 1024

export function isRemoteImageUrl(url: string): boolean {
  return /^https:\/\/.+/i.test(url.trim())
}

async function uploadWithUnsignedPreset(file: File, folder: string): Promise<string> {
  const { cloudinaryCloudName, cloudinaryUploadPreset } = env
  if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
    throw new Error("Cloudinary no está configurado en el frontend (preset unsigned).")
  }
  const form = new FormData()
  form.append("file", file)
  form.append("upload_preset", cloudinaryUploadPreset)
  form.append("folder", folder)
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
    { method: "POST", body: form }
  )
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: { message?: string }
    } | null
    throw new Error(body?.error?.message ?? "Cloudinary rechazó la imagen")
  }
  const data = (await res.json()) as { secure_url?: string }
  if (!data.secure_url || !isRemoteImageUrl(data.secure_url)) {
    throw new Error("Cloudinary no devolvió una URL válida")
  }
  return data.secure_url
}

async function uploadWithBackendSignature(file: File, folder: string): Promise<string> {
  const sig = await api.uploadSignature(folder)
  const form = new FormData()
  form.append("file", file)
  form.append("api_key", sig.api_key)
  form.append("timestamp", String(sig.timestamp))
  form.append("signature", sig.signature)
  form.append("folder", sig.folder)
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${sig.cloud_name}/image/upload`,
    { method: "POST", body: form }
  )
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as {
      error?: { message?: string }
    } | null
    throw new Error(body?.error?.message ?? "No se pudo subir la imagen")
  }
  const data = (await res.json()) as { secure_url?: string }
  if (!data.secure_url || !isRemoteImageUrl(data.secure_url)) {
    throw new Error("Cloudinary no devolvió una URL válida")
  }
  return data.secure_url
}

/**
 * Sube un archivo a Cloudinary y devuelve secure_url.
 * El guardado en MongoDB ocurre después, en el flujo que llame a esta función.
 */
export async function uploadImageToCloudinary(
  file: File,
  folder: "libroscuba" | "libroscuba/tiendas" = "libroscuba"
): Promise<string> {
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen no puede superar 8 MB")
  }
  if (env.hasCloudinaryUpload) {
    return uploadWithUnsignedPreset(file, folder)
  }
  return uploadWithBackendSignature(file, folder)
}
