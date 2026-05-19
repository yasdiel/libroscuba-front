import { useMemo, useState } from "react"
import { Check, MapPin, Plus, Search, Truck, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetBody,
  SheetCloseButton,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { api, cacheKeys, parseLocationsMap } from "@/lib/api"
import { useCachedQuery } from "@/lib/useCachedQuery"
import { cn } from "@/lib/utils"

const LOCATIONS_TTL_MS = 60 * 60 * 1000

interface MunicipiosEnvioSelectProps {
  value: string[]
  onChange: (next: string[]) => void
  /** Provincia/municipio principal (se excluye de la lista para no duplicar). */
  excludeMunicipio?: string
  label?: string
  hint?: string
}

export function MunicipiosEnvioSelect({
  value,
  onChange,
  excludeMunicipio,
  label = "Municipios donde haces envíos (opcional)",
  hint = "Tu tienda aparecerá cuando alguien filtre por estos municipios.",
}: MunicipiosEnvioSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")

  const { data, loading } = useCachedQuery({
    key: cacheKeys.locations(),
    fetcher: () => api.locations(),
    ttlMs: LOCATIONS_TTL_MS,
  })
  const locations = useMemo(() => (data ? parseLocationsMap(data) : {}), [data])

  const filteredProvinces = useMemo(() => {
    const q = search.trim().toLowerCase()
    const result: Array<{ provincia: string; municipios: string[] }> = []
    for (const provincia of Object.keys(locations).sort()) {
      const munis = (locations[provincia] || []).filter(
        (m) => m !== excludeMunicipio && (!q || m.toLowerCase().includes(q))
      )
      if (munis.length > 0) result.push({ provincia, municipios: munis })
    }
    return result
  }, [locations, excludeMunicipio, search])

  const selectedSet = useMemo(() => new Set(value), [value])

  const toggle = (municipio: string) => {
    if (selectedSet.has(municipio)) {
      onChange(value.filter((m) => m !== municipio))
    } else {
      onChange([...value, municipio])
    }
  }

  const removeOne = (municipio: string) => {
    onChange(value.filter((m) => m !== municipio))
  }

  const clearAll = () => onChange([])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-sm">{label}</Label>
        {value.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-gray-500 hover:text-red-600"
          >
            Limpiar
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-50 min-h-12",
          value.length === 0 && "text-gray-400"
        )}
      >
        <span className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-brand" />
          {value.length === 0
            ? "Añadir municipios de envío"
            : `${value.length} municipio${value.length === 1 ? "" : "s"} seleccionado${value.length === 1 ? "" : "s"}`}
        </span>
        <Plus className="h-4 w-4 text-gray-400" />
      </button>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {value.map((m) => (
            <Badge
              key={m}
              variant="secondary"
              className="flex items-center gap-1 pl-2 pr-1 py-1"
            >
              {m}
              <button
                type="button"
                onClick={() => removeOne(m)}
                className="rounded-full p-0.5 hover:bg-black/10"
                aria-label={`Quitar ${m}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-500">{hint}</p>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="max-h-[88vh]">
          <SheetCloseButton />
          <SheetHeader>
            <SheetTitle className="pr-10">Municipios de envío</SheetTitle>
            <SheetDescription>
              Selecciona los municipios a los que envías. Puedes elegir varios y de cualquier provincia.
            </SheetDescription>
          </SheetHeader>
          <SheetBody className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                className="pl-9"
                placeholder="Buscar municipio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus={false}
              />
            </div>

            {value.length > 0 && (
              <div className="rounded-xl bg-brand-light/50 p-3 space-y-2">
                <p className="text-xs font-semibold text-brand">
                  Seleccionados ({value.length})
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {value.map((m) => (
                    <Badge
                      key={m}
                      className="flex items-center gap-1 pl-2 pr-1 py-1"
                    >
                      {m}
                      <button
                        type="button"
                        onClick={() => removeOne(m)}
                        className="rounded-full p-0.5 hover:bg-black/15"
                        aria-label={`Quitar ${m}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {loading ? (
              <p className="py-6 text-center text-sm text-gray-500">Cargando municipios...</p>
            ) : filteredProvinces.length === 0 ? (
              <p className="py-6 text-center text-sm text-gray-500">
                Sin coincidencias para "{search}"
              </p>
            ) : (
              <div className="space-y-4">
                {filteredProvinces.map(({ provincia, municipios }) => (
                  <div key={provincia}>
                    <p className="mb-1.5 flex items-center gap-1 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <MapPin className="h-3 w-3" />
                      {provincia}
                    </p>
                    <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                      {municipios.map((m) => {
                        const checked = selectedSet.has(m)
                        return (
                          <button
                            key={m}
                            type="button"
                            onClick={() => toggle(m)}
                            className={cn(
                              "flex items-center justify-between gap-2 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors min-h-11",
                              checked
                                ? "border-brand bg-brand-light/40 text-gray-900"
                                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                            )}
                          >
                            <span className="truncate">{m}</span>
                            {checked && <Check className="h-4 w-4 shrink-0 text-brand" />}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="sticky bottom-0 -mx-4 mt-4 border-t bg-white p-4">
              <Button className="w-full" onClick={() => setOpen(false)}>
                Listo ({value.length})
              </Button>
            </div>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </div>
  )
}
