/**
 * Validación de móviles cubanos (+53 + 8 dígitos).
 * Prefijos válidos tras +53: 50–59 (Cubacel histórico) y 63 (líneas nuevas desde 2023).
 * @see backend/app/utils/phone.py
 */

export const CUBA_PREFIX = "+53"
export const PHONE_LOCAL_LENGTH = 8
export const PASSWORD_MIN_LENGTH = 6

/** 50–59 (móvil 5 + 7 dígitos) y 63 (móvil 63 + 6 dígitos) */
export const CUBA_MOBILE_TWO_DIGIT_PREFIXES = new Set([
  ...Array.from({ length: 10 }, (_, d) => `5${d}`),
  "63",
])

export const CUBA_MOBILE_PREFIX_HINT = "5X (50–59) o 63"

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

export function isValidCubaMobilePrefix(twoDigits: string): boolean {
  return CUBA_MOBILE_TWO_DIGIT_PREFIXES.has(twoDigits)
}

export function validateLocalPhone(digits: string): string | null {
  if (!digits) return "Ingresa tu número de teléfono"
  if (!/^\d+$/.test(digits)) return "Solo se permiten números"
  if (digits.length >= 2 && !isValidCubaMobilePrefix(digits.slice(0, 2))) {
    return `Prefijo inválido. Usa un móvil cubano (${CUBA_MOBILE_PREFIX_HINT}) después del +53.`
  }
  if (digits.length !== PHONE_LOCAL_LENGTH) {
    return `El número debe tener exactamente ${PHONE_LOCAL_LENGTH} dígitos`
  }
  if (!isValidCubaMobilePrefix(digits.slice(0, 2))) {
    return `Prefijo inválido. Usa un móvil cubano (${CUBA_MOBILE_PREFIX_HINT}) después del +53.`
  }
  return null
}

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `La contraseña debe tener al menos ${PASSWORD_MIN_LENGTH} caracteres`
  }
  return null
}
