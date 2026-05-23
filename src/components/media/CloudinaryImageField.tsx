import { useRef, useState } from "react"
import { ImagePlus, Loader2, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  uploadImageToCloudinary,
  isRemoteImageUrl,
  UPLOADING_IMAGE_MESSAGE,
} from "@/lib/cloudinary"
import { bookListCoverUrl } from "@/lib/utils"

interface CloudinaryImageFieldProps {
  label: string
  hint?: string
  value: string
  folder: "libroscuba" | "libroscuba/tiendas"
  required?: boolean
  disabled?: boolean
  aspectClass?: string
  onChange: (url: string) => void
  onUploadingChange?: (uploading: boolean) => void
}

export function CloudinaryImageField({
  label,
  hint,
  value,
  folder,
  required = false,
  disabled = false,
  aspectClass = "aspect-[4/3]",
  onChange,
  onUploadingChange,
}: CloudinaryImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const setBusy = (busy: boolean) => {
    setUploading(busy)
    onUploadingChange?.(busy)
  }

  const pickFile = async (file: File) => {
    setError(null)
    setBusy(true)
    try {
      const url = await uploadImageToCloudinary(file, folder)
      onChange(url)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen")
    } finally {
      setBusy(false)
    }
  }

  const hasPreview = Boolean(value && isRemoteImageUrl(value))

  return (
    <div className="space-y-2">
      <Label>
        {label}
        {required ? " *" : ""}
      </Label>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {hasPreview ? (
        <div className="space-y-2">
          <div className={`relative overflow-hidden rounded-2xl bg-paper-dark ${aspectClass}`}>
            <img
              src={bookListCoverUrl(value)}
              alt=""
              className="h-full w-full object-cover"
            />
            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 px-3 text-center text-sm font-medium text-white">
                <Loader2 className="h-8 w-8 animate-spin" />
                {UPLOADING_IMAGE_MESSAGE}
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled || uploading}
              onClick={() => inputRef.current?.click()}
            >
              Cambiar imagen
            </Button>
            {!required && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 text-red-600"
                disabled={disabled || uploading}
                onClick={() => onChange("")}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Quitar
              </Button>
            )}
          </div>
        </div>
      ) : (
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => inputRef.current?.click()}
          className={`flex w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-paper-dark text-gray-500 active:bg-paper-dark/80 disabled:opacity-50 ${aspectClass} min-h-[120px]`}
        >
          {uploading ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-brand" />
              <span className="text-sm text-center px-3">{UPLOADING_IMAGE_MESSAGE}</span>
            </>
          ) : (
            <>
              <ImagePlus className="h-8 w-8 text-brand" />
              <span className="text-sm font-medium">Elegir imagen</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        disabled={disabled || uploading}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) void pickFile(file)
          e.target.value = ""
        }}
      />
    </div>
  )
}
