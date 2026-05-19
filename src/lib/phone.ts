export const CUBA_PREFIX = "+53"
export const PHONE_LOCAL_LENGTH = 8
export const PASSWORD_MIN_LENGTH = 6

export function stripPhoneDigits(value: string): string {
  return value.replace(/\D/g, "").slice(0, PHONE_LOCAL_LENGTH)
}

export function formatPhoneForApi(localDigits: string): string {
  return `${CUBA_PREFIX}${localDigits}`
}

export function displayPhoneLocal(whatsappNumber: string): string {
  const digits = whatsappNumber.replace(/\D/g, "")
  if (digits.startsWith("53") && digits.length >= 10) {
    return digits.slice(2, 10)
  }
  return digits.slice(-PHONE_LOCAL_LENGTH)
}

export function validateLocalPhone(digits: string): string | null {
  if (!digits) return "Ingresa tu número de teléfono"
  if (!/^\d+$/.test(digits)) return "Solo se permiten números"
  if (digits.length !== PHONE_LOCAL_LENGTH) {
    return `El número debe tener exactamente ${PHONE_LOCAL_LENGTH} dígitos`
  }
  return null
}

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
  }
  return null
}
