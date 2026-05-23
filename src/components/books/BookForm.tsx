import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { CloudinaryImageField } from "@/components/media/CloudinaryImageField"
import { LocationFilter } from "@/components/filters/LocationFilter"
import { isRemoteImageUrl, UPLOADING_IMAGE_MESSAGE } from "@/lib/cloudinary"
import type { Book, EstadoLibro } from "@/lib/api"

export interface BookFormData {
  titulo: string
  autor: string
  precio: number
  foto_url: string
  descripcion: string
  estado: EstadoLibro
  provincia: string
  municipio: string
}

interface BookFormProps {
  initial?: Book
  defaultLocation?: { provincia: string; municipio: string }
  onSubmit: (data: BookFormData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export function BookForm({
  initial,
  defaultLocation,
  onSubmit,
  onCancel,
  submitLabel = "Publicar libro",
}: BookFormProps) {
  const [titulo, setTitulo] = useState(initial?.titulo ?? "")
  const [autor, setAutor] = useState(initial?.autor ?? "")
  const [precio, setPrecio] = useState(initial?.precio?.toString() ?? "")
  const [fotoUrl, setFotoUrl] = useState(initial?.foto_url ?? "")
  const [descripcion, setDescripcion] = useState(initial?.descripcion ?? "")
  const [estado, setEstado] = useState<EstadoLibro>(initial?.estado ?? "usado")
  const [provincia, setProvincia] = useState(
    initial?.provincia ?? defaultLocation?.provincia ?? ""
  )
  const [municipio, setMunicipio] = useState(
    initial?.municipio ?? defaultLocation?.municipio ?? ""
  )
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (defaultLocation && !initial) {
      setProvincia(defaultLocation.provincia)
      setMunicipio(defaultLocation.municipio)
    }
  }, [defaultLocation, initial])

  const photoReady = isRemoteImageUrl(fotoUrl)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!photoReady) {
      setError("Sube la foto del libro antes de guardar")
      return
    }
    const price = parseFloat(precio)
    if (!titulo || !autor || !price || !provincia || !municipio) {
      setError("Completa todos los campos obligatorios")
      return
    }
    setSaving(true)
    try {
      await onSubmit({
        titulo,
        autor,
        precio: price,
        foto_url: fotoUrl,
        descripcion: descripcion || "",
        estado,
        provincia,
        municipio,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al guardar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <CloudinaryImageField
        label="Foto del libro"
        hint="Sube la foto del libro. Cuando termine de cargar, podrás publicar."
        value={fotoUrl}
        folder="libroscuba"
        required
        aspectClass="aspect-[4/5]"
        onChange={setFotoUrl}
        onUploadingChange={setUploadingPhoto}
      />

      <div className="space-y-1.5">
        <Label htmlFor="titulo">Título *</Label>
        <Input id="titulo" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="autor">Autor *</Label>
        <Input id="autor" value={autor} onChange={(e) => setAutor(e.target.value)} required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="precio">Precio (CUP) *</Label>
          <Input
            id="precio"
            type="number"
            min="1"
            step="1"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label>Estado *</Label>
          <Select value={estado} onValueChange={(v) => setEstado(v as EstadoLibro)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nuevo">Nuevo</SelectItem>
              <SelectItem value="usado">Usado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <LocationFilter
        provincia={provincia}
        municipio={municipio}
        onProvinciaChange={setProvincia}
        onMunicipioChange={setMunicipio}
      />
      <div className="space-y-1.5">
        <Label htmlFor="descripcion">Descripción (opcional)</Label>
        <Textarea
          id="descripcion"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          rows={3}
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          className="flex-1"
          disabled={saving || uploadingPhoto || !photoReady}
        >
          {saving
            ? "Guardando..."
            : uploadingPhoto
              ? UPLOADING_IMAGE_MESSAGE
              : !photoReady
                ? "Falta la foto"
                : submitLabel}
        </Button>
      </div>
    </form>
  )
}
