import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { formatMoney } from "@/lib/currency"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number, currency = "CUP") {
  return formatMoney(price, currency)
}

/** URL más liviana para portadas en rejillas (Cloudinary / Unsplash). */
export function bookListCoverUrl(url: string): string {
  if (!url) return url
  if (url.includes("res.cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/c_fill,w_400,h_500,q_auto:low,f_auto/")
  }
  try {
    const parsed = new URL(url)
    if (parsed.hostname === "images.unsplash.com") {
      parsed.searchParams.set("w", "400")
      parsed.searchParams.set("q", "75")
      return parsed.toString()
    }
  } catch {
    /* URL relativa o inválida: devolver tal cual */
  }
  return url
}

export function whatsappBuyLink(
  phone: string,
  titulo: string,
  autor: string
): string {
  const clean = phone.replace(/\D/g, "")
  const text = encodeURIComponent(
    `Hola, quisiera comprar el libro '${titulo}' de ${autor} que vi en LibrosCuba.`
  )
  return `https://wa.me/${clean}?text=${text}`
}

export function whatsappCartOrderLink(
  phone: string,
  storeName: string,
  lines: { titulo: string; autor: string; precio: number; moneda: string }[],
  totalCurrency: string
): string | null {
  if (!phone || lines.length === 0) return null
  const clean = phone.replace(/\D/g, "")
  const detail = lines
    .map(
      (line, i) =>
        `${i + 1}. «${line.titulo}» — ${line.autor} — ${formatPrice(line.precio, line.moneda)}`
    )
    .join("\n")
  const total = lines.reduce((sum, l) => sum + l.precio, 0)
  const body = [
    `Hola, quisiera comprar los siguientes libros de ${storeName} que vi en LibrosCuba:`,
    "",
    detail,
    "",
    `Total: ${formatPrice(total, totalCurrency)}`,
  ].join("\n")
  return `https://wa.me/${clean}?text=${encodeURIComponent(body)}`
}
