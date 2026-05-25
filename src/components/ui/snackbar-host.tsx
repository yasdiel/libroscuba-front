import { useSnackbarHost } from "@/lib/snackbar"

export function SnackbarHost() {
  const message = useSnackbarHost()
  if (!message) return null

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-20 left-1/2 z-[100] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-gray-800 bg-gray-900 px-4 py-3 text-center text-sm font-medium text-white shadow-lg md:bottom-8"
    >
      {message}
    </div>
  )
}
