import { Navigate, Outlet } from "react-router-dom"
import { AppNav } from "@/components/layout/AppNav"
import { useAuth } from "@/context/AuthContext"
import { authToken } from "@/lib/authToken"

export function AppLayout() {
  const { user, loading } = useAuth()

  if (!loading && authToken.has() && user?.is_admin) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="min-h-screen pb-20 md:pb-6 md:pt-16">
      <AppNav />
      <main className="mx-auto max-w-lg md:max-w-4xl">
        <Outlet />
      </main>
    </div>
  )
}
