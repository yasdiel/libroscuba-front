import { useEffect, useState } from "react"

type Listener = (message: string) => void

let listener: Listener | null = null

export function showSnackbar(message: string) {
  listener?.(message)
}

export function useSnackbarHost() {
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    let timer: number | undefined
    listener = (msg) => {
      setMessage(msg)
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => setMessage(null), 4000)
    }
    return () => {
      listener = null
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  return message
}
