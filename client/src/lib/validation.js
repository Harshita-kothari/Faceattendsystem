export function normalizePhoneInput(value = '') {
  return String(value).replace(/[^\d+\-\s()]/g, '').slice(0, 20)
}

export function isValidPhoneNumber(value = '') {
  const trimmed = String(value).trim()
  if (!trimmed) return true
  if (!/^\+?[\d\s\-()]+$/.test(trimmed)) return false
  const digits = trimmed.replace(/\D/g, '')
  return digits.length >= 10 && digits.length <= 15
}

export function getPhoneValidationMessage(label = 'Phone number') {
  return `${label} must contain 10 to 15 digits.`
}
