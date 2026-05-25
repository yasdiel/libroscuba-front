import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { api } from "@/lib/api"
import {
  bookToCartItem,
  cartItemCount,
  groupCartByStore,
  loadCartFromStorage,
  saveCartToStorage,
  type CartItem,
  type CartStoreGroup,
} from "@/lib/cart"
import { showSnackbar } from "@/lib/snackbar"
import type { Book } from "@/lib/api"

interface CartContextValue {
  items: CartItem[]
  groups: CartStoreGroup[]
  count: number
  syncing: boolean
  hydrated: boolean
  isInCart: (bookId: string) => boolean
  addBook: (book: Book) => boolean
  removeItem: (bookId: string) => void
  clearCart: () => void
  syncCart: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

function itemsFromBooks(books: Book[], previous: CartItem[]): CartItem[] {
  const byId = new Map<string, CartItem>()
  for (const book of books) {
    const item = bookToCartItem(book)
    if (item) byId.set(book.id, item)
  }
  return previous
    .map((item) => byId.get(item.bookId))
    .filter((item): item is CartItem => !!item)
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => loadCartFromStorage())
  const [syncing, setSyncing] = useState(false)
  const [hydrated, setHydrated] = useState(false)
  const syncStarted = useRef(false)

  const persist = useCallback((next: CartItem[]) => {
    setItems(next)
    saveCartToStorage(next)
  }, [])

  const syncCart = useCallback(async () => {
    const stored = loadCartFromStorage()
    if (stored.length === 0) {
      persist([])
      return
    }
    setSyncing(true)
    try {
      const books = await api.cartSync(stored.map((i) => i.bookId))
      const next = itemsFromBooks(books, stored)
      persist(next)
      const removed = stored.length - next.length
      if (removed > 0) {
        showSnackbar(
          removed === 1
            ? "Un libro ya no está disponible y se quitó del carrito."
            : `${removed} libros ya no están disponibles y se quitaron del carrito.`
        )
      }
    } catch {
      /* Mantener carrito local si la API no responde */
    } finally {
      setSyncing(false)
      setHydrated(true)
    }
  }, [persist])

  useEffect(() => {
    if (syncStarted.current) return
    syncStarted.current = true
    void syncCart()
  }, [syncCart])

  const isInCart = useCallback((bookId: string) => items.some((i) => i.bookId === bookId), [items])

  const addBook = useCallback(
    (book: Book) => {
      if (isInCart(book.id)) {
        showSnackbar("Este libro ya está en tu carrito.")
        return false
      }
      const item = bookToCartItem(book)
      if (!item) {
        showSnackbar("Este libro no tiene contacto de WhatsApp disponible.")
        return false
      }
      persist([...items, item])
      showSnackbar("Libro agregado al carrito.")
      return true
    },
    [isInCart, items, persist]
  )

  const removeItem = useCallback(
    (bookId: string) => {
      persist(items.filter((i) => i.bookId !== bookId))
    },
    [items, persist]
  )

  const clearCart = useCallback(() => persist([]), [persist])

  const groups = useMemo(() => groupCartByStore(items), [items])
  const count = cartItemCount(items)

  const value = useMemo(
    () => ({
      items,
      groups,
      count,
      syncing,
      hydrated,
      isInCart,
      addBook,
      removeItem,
      clearCart,
      syncCart,
    }),
    [items, groups, count, syncing, hydrated, isInCart, addBook, removeItem, clearCart, syncCart]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart debe usarse dentro de CartProvider")
  return ctx
}
