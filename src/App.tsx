import { HashRouter, Navigate, Route, Routes } from "react-router-dom"
import { AppLayout } from "@/components/layout/AppLayout"
import { AuthProvider } from "@/context/AuthContext"
import { AdminPage } from "@/pages/AdminPage"
import { HomePage } from "@/pages/HomePage"
import { LoginPage } from "@/pages/LoginPage"
import { ProfilePage } from "@/pages/ProfilePage"
import { PublishPage } from "@/pages/PublishPage"
import { StorePage } from "@/pages/StorePage"
import { TermsPage } from "@/pages/TermsPage"

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomePage />} />
            <Route path="publicar" element={<PublishPage />} />
            <Route path="tienda/:id" element={<StorePage />} />
            <Route path="terminos" element={<TermsPage />} />
            <Route path="perfil" element={<ProfilePage />} />
          </Route>
          <Route path="login" element={<LoginPage />} />
          <Route path="admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  )
}

