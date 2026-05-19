import { useNavigate } from "react-router-dom"
import { BookForm, type BookFormData } from "@/components/books/BookForm"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"
import { api } from "@/lib/api"

export function PublishPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-gray-600">Inicia sesión para publicar libros en tu tienda.</p>
        <Button onClick={() => navigate("/login")}>Iniciar sesión</Button>
      </div>
    )
  }

  const handleSubmit = async (data: BookFormData) => {
    const payload = {
      ...data,
      descripcion: data.descripcion || undefined,
    }
    await api.createBook(payload)
    navigate("/perfil")
  }

  return (
    <div className="px-4 py-4">
      <h1 className="mb-4 text-xl font-bold">Publicar libro</h1>
      <BookForm
        defaultLocation={{ provincia: user.provincia, municipio: user.municipio }}
        onSubmit={handleSubmit}
        submitLabel="Publicar libro"
      />
    </div>
  )
}

