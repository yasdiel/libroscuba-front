import { Outlet } from "react-router-dom"
import { BottomNav } from "./BottomNav"

export function AppLayout() {
  return (
    <div className="min-h-screen pb-20 md:pb-0">
      <main className="mx-auto max-w-lg md:max-w-4xl">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}



