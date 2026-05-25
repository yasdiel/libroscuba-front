import type { Book, EstadoLibro } from "@/lib/api"

export const CART_STORAGE_KEY = "libroscuba_cart_v1"

export interface CartItem {
  bookId: string
  ownerId: string
  titulo: string
  autor: string
  precio: number
  foto_url: string
  estado: EstadoLibro
  provincia: string
  municipio: string
  vendedor_nombre: string
  vendedor_whatsapp: string
  vendedor_tienda_slug?: string | null
}

export interface CartStoreGroup {
  ownerId: string
  storeName: string
  whatsapp: string
  tiendaSlug?: string | null
  items: CartItem[]
  subtotal: number
}

export function bookToCartItem(book: Book): CartItem | null {
  if (!book.vendedor_whatsapp) return null
  return {
    bookId: book.id,
    ownerId: book.owner_id,
    titulo: book.titulo,
    autor: book.autor,
    precio: book.precio,
    foto_url: book.foto_url,
    estado: book.estado,
    provincia: book.provincia,
    municipio: book.municipio,
    vendedor_nombre: book.vendedor_nombre ?? "Tienda",
    vendedor_whatsapp: book.vendedor_whatsapp,
    vendedor_tienda_slug: book.vendedor_tienda_slug,
  }
}

export function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.filter(isCartItem)
  } catch {
    return []
  }
}

export function saveCartToStorage(items: CartItem[]): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
}

function isCartItem(value: unknown): value is CartItem {
  if (!value || typeof value !== "object") return false
  const o = value as Record<string, unknown>
  return (
    typeof o.bookId === "string" &&
    typeof o.ownerId === "string" &&
    typeof o.titulo === "string" &&
    typeof o.autor === "string" &&
    typeof o.precio === "number" &&
    typeof o.vendedor_whatsapp === "string"
  )
}

export function groupCartByStore(items: CartItem[]): CartStoreGroup[] {
  const map = new Map<string, CartStoreGroup>()
  for (const item of items) {
    let group = map.get(item.ownerId)
    if (!group) {
      group = {
        ownerId: item.ownerId,
        storeName: item.vendedor_nombre,
        whatsapp: item.vendedor_whatsapp,
        tiendaSlug: item.vendedor_tienda_slug,
        items: [],
        subtotal: 0,
      }
      map.set(item.ownerId, group)
    }
    group.items.push(item)
    group.subtotal += item.precio
  }
  return Array.from(map.values())
}

export function cartItemCount(items: CartItem[]): number {
  return items.length
}
