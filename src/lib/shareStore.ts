import { storePath } from "@/lib/storeRoutes"

export function getPublicStoreUrl(tiendaSlug: string): string {
  const hash = storePath(tiendaSlug)
  if (typeof window === "undefined") return hash
  const base = `${window.location.origin}${window.location.pathname}`.replace(/\/$/, "")
  return `${base}#${hash}`
}

export function storeCatalogShareText(storeName: string, url: string): string {
  return `Visita mi catálogo «${storeName}» en LibrosCuba:\n${url}`
}

export function whatsappShareUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`
}

export function telegramShareUrl(url: string, text: string): string {
  const params = new URLSearchParams({ url, text })
  return `https://t.me/share/url?${params.toString()}`
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement("textarea")
      ta.value = text
      ta.style.position = "fixed"
      ta.style.left = "-9999px"
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand("copy")
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }
}
