import { normalizePhone } from '#services/normalization_service'

export function buildVehicleContactMessage(input: {
  employeeName: string
  vehicleLabel?: string | null
  licensePlate?: string | null
}) {
  const vehicleText = input.vehicleLabel ? ` sobre o veiculo ${input.vehicleLabel}` : ''
  const plateText = input.licensePlate ? `, placa ${input.licensePlate}` : ''

  return `Ola, ${input.employeeName}. Somos da portaria da Rede. Precisamos falar com voce${vehicleText}${plateText}. Pode responder esta mensagem?`
}

export function buildWhatsAppUrl(phone: string, message: string) {
  const normalizedPhone = normalizePhone(phone)
  const encodedMessage = encodeURIComponent(message)
  return `https://web.whatsapp.com/send?phone=${normalizedPhone}&text=${encodedMessage}`
}
