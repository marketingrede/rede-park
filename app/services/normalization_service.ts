export function normalizeSearchText(value: string | null | undefined) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase()
}

export function normalizeDigits(value: string | null | undefined) {
  return String(value ?? '').replace(/\D/g, '')
}

export function normalizePlate(value: string | null | undefined) {
  return normalizeSearchText(value).replace(/[^A-Z0-9]/g, '')
}

export function formatPlate(value: string | null | undefined) {
  const normalizedPlate = normalizePlate(value)
  if (normalizedPlate.length <= 3) {
    return normalizedPlate
  }

  return `${normalizedPlate.slice(0, 3)}-${normalizedPlate.slice(3)}`
}

export function normalizePhone(value: string | null | undefined) {
  const digits = normalizeDigits(value)
  if (!digits) {
    return ''
  }

  if (digits.startsWith('55')) {
    return digits
  }

  return `55${digits}`
}

export function makeSeniorSourceKey(input: {
  fullName: string
  birthDate: string | null
  costCenterCode: string | null
}) {
  const normalizedName = normalizeSearchText(input.fullName)
  const normalizedCostCenter = normalizeSearchText(input.costCenterCode)
  return [normalizedName, input.birthDate ?? 'SEM-DATA', normalizedCostCenter || 'SEM-CC'].join('|')
}
