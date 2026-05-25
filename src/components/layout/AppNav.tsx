import { BookOpen, FileText, Home, PlusCircle, Shield, User } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

function useNavLinks() {
  const { user } = useAuth()
  return [
    { to: "/", icon: Home, label: "Inicio" },
    { to: "/publicar", icon: PlusCircle, label: "Publicar" },
    { to: "/terminos", icon: FileText, label: "Términos" },
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
}: {
  to: string
  icon: typeof Home
  label: string
  layout: "mobile" | "desktop"
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "font-medium transition-colors",
          layout === "mobile"
            ? cn(
                "flex min-h-[56px] min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 text-xs",
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
          <Icon className={layout === "mobile" ? "h-6 w-6" : "h-4 w-4"} strokeWidth={isActive ? 2.5 : 2} />
          <span>{label}</span>
        </>
      )}
    </NavLink>
  )
}

export function AppNav() {
  const links = useNavLinks()

  return (
    <>
      {/* Móvil: barra inferior */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-paper/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_20px_rgba(42,37,32,0.06)] backdrop-blur md:hidden"
        aria-label="Navegación principal"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-around">
          {links.map((link) => (
            <NavItem key={link.to} {...link} layout="mobile" />
          ))}
        </div>
      </nav>

      {/* Escritorio: barra superior */}
      <header className="fixed top-0 left-0 right-0 z-40 hidden border-b border-gray-200 bg-paper/95 shadow-sm backdrop-blur md:block">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between gap-6 px-4 lg:px-6">
          <NavLink
            to="/"
            className="flex items-center gap-2 font-display text-lg font-semibold text-brand transition-opacity hover:opacity-90"
          >
            <BookOpen className="h-5 w-5 shrink-0" aria-hidden />
            LibrosCuba
          </NavLink>
          <nav className="flex items-center gap-1" aria-label="Navegación principal">
            {links.map((link) => (
              <NavItem key={link.to} {...link} layout="desktop" />
            ))}
          </nav>
        </div>
      </header>
    </>
  )
}
