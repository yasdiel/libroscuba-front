import type { Book, EstadoLibro } from "@/lib/api"
import { BASE_CURRENCY, convertAmount } from "@/lib/currency"

export const CART_STORAGE_KEY = "libroscuba_cart_v2"

export interface CartItem {
  bookId: string
  ownerId: string
  titulo: string
  autor: string
  precio: number
  moneda: string
  monedas_aceptadas: string[]
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
  monedas_aceptadas: string[]
  moneda_pago: string
  subtotal: number
}

export interface CartStorageData {
  items: CartItem[]
  paymentByStore: Record<string, string>
}

export function bookToCartItem(book: Book): CartItem | null {
  if (!book.vendedor_whatsapp) return null
  const moneda = book.moneda || BASE_CURRENCY
  const monedas_aceptadas =
    book.monedas_aceptadas?.length ? book.monedas_aceptadas : [moneda]
  return {
    bookId: book.id,
    ownerId: book.owner_id,
    titulo: book.titulo,
    autor: book.autor,
    precio: book.precio,
    moneda,
    monedas_aceptadas,
    foto_url: book.foto_url,
    estado: book.estado,
    provincia: book.provincia,
    municipio: book.municipio,
    vendedor_nombre: book.vendedor_nombre ?? "Tienda",
    vendedor_whatsapp: book.vendedor_whatsapp,
    vendedor_tienda_slug: book.vendedor_tienda_slug,
  }
}

export function loadCartFromStorage(): CartStorageData {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY)
    if (!raw) return { items: [], paymentByStore: {} }
    const parsed = JSON.parse(raw) as unknown
    if (Array.isArray(parsed)) {
      return { items: parsed.filter(isCartItem), paymentByStore: {} }
    }
    if (parsed && typeof parsed === "object") {
      const o = parsed as Record<string, unknown>
      const items = Array.isArray(o.items) ? o.items.filter(isCartItem) : []
      const paymentByStore =
        o.paymentByStore && typeof o.paymentByStore === "object"
          ? (o.paymentByStore as Record<string, string>)
          : {}
      return { items, paymentByStore }
    }
    return { items: [], paymentByStore: {} }
  } catch {
    return { items: [], paymentByStore: {} }
  }
}

export function saveCartToStorage(data: CartStorageData): void {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(data))
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

export function groupCartByStore(
  items: CartItem[],
  paymentByStore: Record<string, string>,
  rates: Record<string, number>
): CartStoreGroup[] {
  const map = new Map<string, CartStoreGroup>()
  for (const item of items) {
    let group = map.get(item.ownerId)
    const accepted = item.monedas_aceptadas?.length
      ? item.monedas_aceptadas
      : [item.moneda || BASE_CURRENCY]
    if (!group) {
      const defaultPay =
        paymentByStore[item.ownerId] && accepted.includes(paymentByStore[item.ownerId])
          ? paymentByStore[item.ownerId]
          : accepted[0]
      group = {
        ownerId: item.ownerId,
        storeName: item.vendedor_nombre,
        whatsapp: item.vendedor_whatsapp,
        tiendaSlug: item.vendedor_tienda_slug,
        items: [],
        monedas_aceptadas: [...accepted],
        moneda_pago: defaultPay,
        subtotal: 0,
      }
      map.set(item.ownerId, group)
    } else {
      group.monedas_aceptadas = group.monedas_aceptadas.filter((code) =>
        accepted.includes(code)
      )
      if (group.monedas_aceptadas.length === 0) {
        group.monedas_aceptadas = [...accepted]
      }
    }
    group.items.push(item)
  }

  for (const group of map.values()) {
    const pay = paymentByStore[group.ownerId]
    if (pay && group.monedas_aceptadas.includes(pay)) {
      group.moneda_pago = pay
    } else if (!group.monedas_aceptadas.includes(group.moneda_pago)) {
      group.moneda_pago = group.monedas_aceptadas[0]
    }
    group.subtotal = group.items.reduce((sum, item) => {
      const line = convertAmount(
        item.precio,
        item.moneda || BASE_CURRENCY,
        group.moneda_pago,
        rates
      )
      return sum + line
    }, 0)
  }

  return Array.from(map.values())
}

export function cartItemCount(items: CartItem[]): number {
  return items.length
}

export function itemPriceInCurrency(
  item: CartItem,
  targetCurrency: string,
  rates: Record<string, number>
): number {
  return convertAmount(item.precio, item.moneda || BASE_CURRENCY, targetCurrency, rates)
}
