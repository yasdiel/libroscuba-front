import { useRef, useState } from "react"
import { ImagePlus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { api } from "@/lib/api"
import { env } from "@/lib/env"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [manualUrl, setManualUrl] = useState("")
  const { cloudinaryCloudName: cloudName, cloudinaryUploadPreset: uploadPreset } = env

  const uploadFile = async (file: File) => {
    setUploading(true)
    try {
      if (cloudName && uploadPreset) {
        const form = new FormData()
        form.append("file", file)
        form.append("upload_preset", uploadPreset)
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: form }
        )
        if (!res.ok) throw new Error("Error al subir imagen")
        const data = await res.json()
        onChange(data.secure_url)
        return
      }
      const sig = await api.uploadSignature()
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
      if (!res.ok) throw new Error("Error al subir imagen")
      const data = await res.json()
      onChange(data.secure_url)
    } catch {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") onChange(reader.result)
      }
      reader.readAsDataURL(file)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-3">
      <Label>Foto del libro *</Label>
      {value ? (
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100">
          <img src={value} alt="Vista previa" className="h-full w-full object-cover" />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="absolute bottom-2 right-2"
            onClick={() => inputRef.current?.click()}
          >
            Cambiar foto
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex min-h-[140px] w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500 active:bg-gray-100"
        >
          {uploading ? (
            <Loader2 className="h-8 w-8 animate-spin text-brand" />
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-brand" />
              <span className="text-sm font-medium">Toca para subir foto</span>
            </>
          )}
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadFile(file)
        }}
      />
      <div className="space-y-1">
        <Label className="text-xs text-gray-500">O pega URL de imagen (demo)</Label>
        <div className="flex gap-2">
          <Input
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://..."
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => manualUrl && onChange(manualUrl)}
          >
            Usar
          </Button>
        </div>
      </div>
    </div>
  )
}



