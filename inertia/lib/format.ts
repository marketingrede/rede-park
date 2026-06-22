export function formatDate(value?: string | null) {
  if (!value) {
    return 'Nao informado'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value.slice(0, 10)
  }

  return new Intl.DateTimeFormat('pt-BR').format(date)
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return 'Em aberto'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

export function formatPlate(value?: string | null) {
  const plate = String(value ?? '')
    .replace(/[^A-Z0-9]/gi, '')
    .toUpperCase()
  if (plate.length <= 3) {
    return plate || 'Sem placa'
  }

  return `${plate.slice(0, 3)}-${plate.slice(3)}`
}

export function formatPhone(value?: string | null) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (!digits) {
    return 'Sem telefone'
  }

  const localDigits = digits.startsWith('55') ? digits.slice(2) : digits
  if (localDigits.length === 11) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 7)}-${localDigits.slice(7)}`
  }

  if (localDigits.length === 10) {
    return `(${localDigits.slice(0, 2)}) ${localDigits.slice(2, 6)}-${localDigits.slice(6)}`
  }

  return digits
}

export function makeInitials(name?: string | null) {
  const parts = String(name ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (parts.length === 0) {
    return 'RP'
  }

  const first = parts[0]?.charAt(0) ?? 'R'
  const last = parts.length > 1 ? parts[parts.length - 1]?.charAt(0) : parts[0]?.charAt(1)
  return `${first}${last ?? 'P'}`.toUpperCase()
}
