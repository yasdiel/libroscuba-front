const TOKEN_KEY = "lc_token"

/** Token JWT persistido entre visitas (localStorage). */
export const authToken = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      return null
    }
  },

  set(token: string): void {
    try {
      localStorage.setItem(TOKEN_KEY, token)
    } catch {
      /* quota / modo privado estricto */
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      /* ignore */
    }
  },

  has(): boolean {
    return Boolean(authToken.get())
  },
}
