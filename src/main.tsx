import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { bootstrapCatalog } from "@/lib/bootstrapCatalog"
import App from "./App.tsx"
import "./index.css"

bootstrapCatalog()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>
)



