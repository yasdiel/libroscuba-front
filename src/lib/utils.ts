import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number) {
  return `${price.toFixed(0)} CUP`
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
