import vine from '@vinejs/vine'

const optionalText = (maxLength: number) =>
  vine.string().trim().maxLength(maxLength).optional().nullable()
const requiredText = (maxLength: number) => vine.string().trim().minLength(1).maxLength(maxLength)
const optionalPhone = () => vine.string().trim().maxLength(32).optional().nullable()

export const employeeValidator = vine.create({
  fullName: requiredText(180),
  birthDate: vine.date().optional().nullable(),
  costCenterCode: optionalText(40),
  costCenterDescription: optionalText(220),
  roleName: optionalText(140),
  companyName: optionalText(160),
  phone: optionalPhone(),
  alternatePhone: optionalPhone(),
  email: vine.string().trim().email().maxLength(254).optional().nullable(),
  status: vine.enum(['active', 'inactive']).optional(),
  notes: optionalText(2000),
})

export const vehicleValidator = vine.create({
  employeeId: vine.number().withoutDecimals().positive(),
  licensePlate: requiredText(12),
  vehicleType: vine.enum(['car', 'motorcycle', 'truck', 'van', 'other']),
  manufacturer: optionalText(80),
  model: optionalText(100),
  year: vine.number().withoutDecimals().range([1900, 2100]).optional().nullable(),
  color: optionalText(40),
  status: vine.enum(['active', 'inactive']).optional(),
  notes: optionalText(2000),
})

export const visitorValidator = vine.create({
  fullName: requiredText(180),
  cpf: requiredText(20),
  licensePlate: requiredText(12),
  vehicleType: optionalText(40),
  manufacturer: optionalText(80),
  model: optionalText(100),
  year: vine.number().withoutDecimals().range([1900, 2100]).optional().nullable(),
  companyName: optionalText(160),
  visitReason: optionalText(220),
  notes: optionalText(2000),
})

export const userManagementValidator = vine.create({
  fullName: requiredText(180),
  email: vine.string().trim().email().maxLength(254),
  password: vine
    .string()
    .minLength(8)
    .maxLength(32)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/)
    .optional(),
  role: vine.enum(['admin', 'operator']),
  status: vine.enum(['active', 'inactive']),
})

export const contactAttemptValidator = vine.create({
  employeeId: vine.number().withoutDecimals().positive(),
  targetPhone: requiredText(32),
  message: requiredText(1000),
})
