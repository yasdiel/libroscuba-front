const PROVINCIA_KEY = "lc_provincia"
const MUNICIPIO_KEY = "lc_municipio"

/** Provincia y municipio del catálogo (filtro del home). */
export const locationPrefs = {
  get(): { provincia: string; municipio: string } {
    try {
      return {
        provincia: localStorage.getItem(PROVINCIA_KEY)?.trim() ?? "",
        municipio: localStorage.getItem(MUNICIPIO_KEY)?.trim() ?? "",
      }
    } catch {
      return { provincia: "", municipio: "" }
    }
  },

  set(provincia: string, municipio: string): void {
    try {
      const p = provincia.trim()
      const m = municipio.trim()
      if (p) localStorage.setItem(PROVINCIA_KEY, p)
      else localStorage.removeItem(PROVINCIA_KEY)
      if (m) localStorage.setItem(MUNICIPIO_KEY, m)
      else localStorage.removeItem(MUNICIPIO_KEY)
    } catch {
      /* quota / modo privado */
    }
  },
}
