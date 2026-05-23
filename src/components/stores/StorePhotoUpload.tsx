import { useRef, useState } from "react"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { env } from "@/lib/env"
import { bookListCoverUrl } from "@/lib/utils"

interface StorePhotoUploadProps {
  value: string
  onChange: (url: string) => void
  disabled?: boolean
}

function isHttpUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

async function uploadToCloudinary(file: File): Promise<string> {
  const { cloudinaryCloudName: cloudName, cloudinaryUploadPreset: uploadPreset } = env

  if (cloudName && uploadPreset) {
    const form = new FormData()
    form.append("file", file)
    form.append("upload_preset", uploadPreset)
    form.append("folder", "libroscuba/tiendas")
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: form }
    )
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as {
        error?: { message?: string }
      } | null
      throw new Error(body?.error?.message ?? "No se pudo subir la imagen a Cloudinary")
    }
    const data = await res.json()
    return data.secure_url as string
  }

  const sig = await api.uploadSignature("libroscuba/tiendas")
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
  const data = await res.json()
  return data.secure_url as string
}

export function StorePhotoUpload({ value, onChange, disabled }: StorePhotoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const uploadFile = async (file: File) => {
    if (file.size > 8 * 1024 * 1024) {
      setUploadError("La imagen no puede superar 8 MB.")
      return
    }
    setUploading(true)
    setUploadError(null)
    try {
      const url = await uploadToCloudinary(file)
      if (!isHttpUrl(url)) {
        throw new Error("URL de imagen inválida")
      }
      onChange(url)
    } catch (err) {
      setUploadError(
        err instanceof Error
          ? err.message
          : "No se pudo subir la foto. Comprueba Cloudinary en producción."
      )
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>Foto de la tienda (opcional)</Label>
      <p className="text-xs text-gray-500">
        Logo o imagen de tu tienda. Si no subes ninguna, se muestra la inicial del nombre.
      </p>
      {uploadError && <p className="text-sm text-red-600">{uploadError}</p>}
      {value && isHttpUrl(value) ? (
        <div className="flex items-center gap-3">
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-gray-100">
            <img
              src={bookListCoverUrl(value)}
              alt="Foto de tu tienda"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              Cambiar foto
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-1.5 text-red-600"
              disabled={disabled || uploading}
              onClick={() => onChange("")}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Quitar foto
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[100px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500 active:bg-gray-100 disabled:opacity-50"
        >
          {uploading ? (
            <Loader2 className="h-7 w-7 animate-spin text-brand" />
          ) : (
            <>
              <ImagePlus className="h-7 w-7 text-brand" />
              <span className="text-sm font-medium">Subir logo o foto</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadFile(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}
