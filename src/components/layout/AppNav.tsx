import { BookOpen, Home, PlusCircle, Shield, ShoppingCart, User } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useCart } from "@/context/CartContext"
import { cn } from "@/lib/utils"

function useNavLinks() {
  const { user } = useAuth()
  return [
    { to: "/", icon: Home, label: "Inicio" },
    { to: "/carrito", icon: ShoppingCart, label: "Carrito", badge: true as const },
    { to: "/publicar", icon: PlusCircle, label: "Publicar" },
    user?.is_admin
      ? { to: "/admin", icon: Shield, label: "Admin" }
      : { to: "/perfil", icon: User, label: "Perfil" },
  ] as const
}

function NavItem({
  to,
  icon: Icon,
  label,
  layout,
  badgeCount,
}: {
  to: string
  icon: typeof Home
  label: string
  layout: "mobile" | "desktop"
  badgeCount?: number
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "font-medium transition-colors",
          layout === "mobile"
            ? cn(
                "flex min-h-[56px] min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 text-xs",
                isActive ? "text-brand" : "text-gray-500"
              )
            : cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                isActive
                  ? "bg-brand text-paper shadow-sm"
                  : "text-gray-600 hover:bg-brand-light/80 hover:text-brand"
              )
        )
      }
    >
      {({ isActive }) => (
        <>
          <span className="relative">
            <Icon className={layout === "mobile" ? "h-6 w-6" : "h-4 w-4"} strokeWidth={isActive ? 2.5 : 2} />
            {badgeCount != null && badgeCount > 0 && (
              <span
                className={cn(
                  "absolute flex items-center justify-center rounded-full bg-brand font-bold text-paper",
                  layout === "mobile"
                    ? "-right-2 -top-1.5 h-4 min-w-4 px-0.5 text-[10px]"
                    : "-right-2.5 -top-1.5 h-4 min-w-4 px-0.5 text-[10px]"
                )}
              >
                {badgeCount > 9 ? "9+" : badgeCount}
              </span>
            )}
          </span>
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function AppNav() {
  const links = useNavLinks()
  const { count } = useCart()

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-paper/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(42,37,32,0.06)] backdrop-blur md:hidden"
        aria-label="Navegación principal"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {links.map((link) => (
            <NavItem
              key={link.to}
              {...link}
              layout="mobile"
              badgeCount={"badge" in link && link.badge ? count : undefined}
            />
          ))}
        </div>
      </nav>

      <header className="fixed top-0 left-0 right-0 z-40 hidden border-b border-gray-200 bg-paper/95 shadow-sm backdrop-blur md:block">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-4 px-4 lg:px-6">
          <NavLink
            to="/"
            className="flex items-center gap-2 font-display text-lg font-semibold text-brand transition-opacity hover:opacity-90"
          >
            <BookOpen className="h-5 w-5 shrink-0" aria-hidden />
            LibrosCuba
          </NavLink>
          <nav className="flex items-center gap-1" aria-label="Navegación principal">
            {links.map((link) => (
              <NavItem
                key={link.to}
                {...link}
                layout="desktop"
                badgeCount={"badge" in link && link.badge ? count : undefined}
              />
            ))}
          </nav>
        </div>
      </header>
    </>
  )
}
