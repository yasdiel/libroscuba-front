import { FileText, Home, PlusCircle, Shield, User } from "lucide-react"
import { NavLink } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { cn } from "@/lib/utils"

export function BottomNav() {
  const { user } = useAuth()

  const links = [
    { to: "/", icon: Home, label: "Inicio" },
    { to: "/publicar", icon: PlusCircle, label: "Publicar" },
    { to: "/terminos", icon: FileText, label: "Términos" },
    user?.is_admin
      ? { to: "/admin", icon: Shield, label: "Admin" }
      : { to: "/perfil", icon: User, label: "Perfil" },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex min-h-[56px] min-w-[72px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors",
                isActive ? "text-brand" : "text-gray-500"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-6 w-6" strokeWidth={isActive ? 2.5 : 2} />
                <span>{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}



