import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("LibrosCuba:", error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-6 text-center">
          <h1 className="text-lg font-semibold text-gray-900">Algo salió mal</h1>
          <p className="max-w-md text-sm text-gray-600">{this.state.error.message}</p>
          <Button onClick={() => window.location.reload()}>Recargar</Button>
        </div>
      )
    }
    return this.props.children
  }
}
