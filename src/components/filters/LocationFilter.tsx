import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { api, parseLocationsMap } from "@/lib/api"

interface LocationFilterProps {
  provincia: string
  municipio: string
  onProvinciaChange: (v: string) => void
  onMunicipioChange: (v: string) => void
  /** En registro: obliga elegir provincia y municipio (sin opción "Todas"). */
  required?: boolean
}

export function LocationFilter({
  provincia,
  municipio,
  onProvinciaChange,
  onMunicipioChange,
  required = false,
}: LocationFilterProps) {
  const [locations, setLocations] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    api
      .locations()
      .then((data) => setLocations(parseLocationsMap(data)))
      .catch(() => setLocations({}))
      .finally(() => setLoading(false))
  }, [])

  const provincias = Object.keys(locations ?? {}).sort()
  const municipios = provincia ? locations[provincia] || [] : []

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label>Provincia</Label>
        <Select
          value={required ? provincia || undefined : provincia || "all"}
          onValueChange={(v) => {
            if (!required && v === "all") {
              onProvinciaChange("")
              onMunicipioChange("")
              return
            }
            onProvinciaChange(v)
            onMunicipioChange("")
          }}
          disabled={loading}
          required={required}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={loading ? "Cargando..." : required ? "Selecciona" : "Todas"}
            />
          </SelectTrigger>
          <SelectContent>
            {!required && <SelectItem value="all">Todas</SelectItem>}
            {provincias.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label>Municipio</Label>
        <Select
          value={required ? municipio || undefined : municipio || "all"}
          onValueChange={(v) => {
            if (!required && v === "all") {
              onMunicipioChange("")
              return
            }
            onMunicipioChange(v)
          }}
          disabled={!provincia || loading}
          required={required}
        >
          <SelectTrigger>
            <SelectValue
              placeholder={loading ? "Cargando..." : required ? "Selecciona" : "Todos"}
            />
          </SelectTrigger>
          <SelectContent>
            {!required && <SelectItem value="all">Todos</SelectItem>}
            {municipios.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}



