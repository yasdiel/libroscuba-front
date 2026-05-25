import { useState } from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { Flag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { api, ApiError } from "@/lib/api"
import { showSnackbar } from "@/lib/snackbar"

const REASONS: { value: string; label: string }[] = [
  { value: "contenido_inapropiado", label: "Contenido inapropiado" },
  { value: "no_es_libro_fisico", label: "No es un libro físico" },
  { value: "fraude_estafa", label: "Fraude o estafa" },
  { value: "otro", label: "Otro" },
]

interface ReportBookDialogProps {
  bookId: string
  bookTitle: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ReportBookDialog({
  bookId,
  bookTitle,
  open,
  onOpenChange,
}: ReportBookDialogProps) {
  const [reason, setReason] = useState("")
  const [details, setDetails] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const submit = async () => {
    if (!reason) {
      setError("Selecciona un motivo")
      return
    }
    setError("")
    setLoading(true)
    try {
      await api.reportBook(bookId, { reason, details: details.trim() || undefined })
      showSnackbar("Reporte enviado. Gracias por ayudar a mantener la comunidad.")
      onOpenChange(false)
      setReason("")
      setDetails("")
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 409) {
          showSnackbar(err.message)
          onOpenChange(false)
          return
        }
        setError(err.message)
      } else {
        setError("No se pudo enviar el reporte")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-5 shadow-2xl outline-none">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-brand" />
              <DialogPrimitive.Title className="text-base font-semibold text-gray-900">
                Reportar publicación
              </DialogPrimitive.Title>
            </div>
            <DialogPrimitive.Close className="rounded-lg p-1 text-gray-500 hover:bg-gray-100">
              <X className="h-5 w-5" />
            </DialogPrimitive.Close>
          </div>
          <DialogPrimitive.Description className="mt-2 text-sm text-gray-600">
            Indica por qué «{bookTitle}» incumple las normas de LibrosCuba.
          </DialogPrimitive.Description>

          <div className="mt-4 space-y-4">
            <div className="space-y-1.5">
              <Label>Motivo</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Elige un motivo" />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="report-details">Detalles (opcional)</Label>
              <Textarea
                id="report-details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Describe brevemente el problema..."
                maxLength={500}
                rows={3}
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={() => void submit()} disabled={loading}>
              {loading ? "Enviando..." : "Enviar reporte"}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
