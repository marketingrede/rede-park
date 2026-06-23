import type { HttpContext } from '@adonisjs/core/http'
import Employee from '#models/employee'
import ApprovalRequest from '#models/approval_request'
import { storeUploadedImage } from '#services/upload_storage_service'
import {
  normalizeSearchText,
  normalizePhone,
  normalizePlate,
} from '#services/normalization_service'
import { DateTime } from 'luxon'

export default class PublicCollaboratorsController {
  async showForm({ inertia }: HttpContext) {
    return inertia.render('public/collaborator_register', {})
  }

  async lookup({ request, response }: HttpContext) {
    const { fullName, birthDate } = request.only(['fullName', 'birthDate'])

    if (!fullName) {
      return response.badRequest({ message: 'Nome completo é obrigatório.' })
    }

    if (!birthDate) {
      return response.badRequest({ message: 'Data de nascimento é obrigatória.' })
    }

    const normalizedSearch = normalizeSearchText(fullName)
    const inputBirthDate = DateTime.fromISO(birthDate)

    const employees = await Employee.query()
      .where('normalized_name', 'like', `%${normalizedSearch}%`)
      .where('status', 'active')

    let matchedEmployee: InstanceType<typeof Employee> | null = null

    for (const emp of employees) {
      if (emp.birthDate && emp.birthDate.hasSame(inputBirthDate, 'day')) {
        matchedEmployee = emp
        break
      }
    }

    if (!matchedEmployee) {
      return response.ok({ found: false })
    }

    // Mask name for privacy (LGPD compliance)
    const nameParts = matchedEmployee.fullName.split(' ')
    const maskedName = nameParts
      .map((part, index) => {
        if (index === 0 || index === nameParts.length - 1) return part
        return part[0] + '*'.repeat(part.length - 1)
      })
      .join(' ')

    return response.ok({
      found: true,
      employee: {
        id: matchedEmployee.id,
        fullName: maskedName,
        companyName: matchedEmployee.companyName,
        roleName: matchedEmployee.roleName,
        email: matchedEmployee.email,
        phone: matchedEmployee.phone,
      },
    })
  }

  async submit({ request, response }: HttpContext) {
    const payload = request.all()
    const photo = request.file('photo', {
      size: '4mb',
      extnames: ['jpg', 'png', 'jpeg'],
    })

    const photoPath = await storeUploadedImage(photo, 'employees')

    // Create the approval request without CPF
    await ApprovalRequest.create({
      employeeId: payload.employeeId ? Number(payload.employeeId) : null,
      cpf: '',
      normalizedCpf: '',
      fullName: payload.fullName,
      birthDate: payload.birthDate ? DateTime.fromISO(payload.birthDate) : null,
      phone: payload.phone ? normalizePhone(payload.phone) : null,
      alternatePhone: payload.alternatePhone ? normalizePhone(payload.alternatePhone) : null,
      email: payload.email || null,
      photoPath: photoPath,
      companyName: payload.companyName || null,
      roleName: payload.roleName || null,
      vehiclePlate: payload.vehiclePlate ? normalizePlate(payload.vehiclePlate) : null,
      vehicleManufacturer: payload.vehicleManufacturer || null,
      vehicleModel: payload.vehicleModel || null,
      vehicleColor: payload.vehicleColor || null,
      vehicleYear: payload.vehicleYear ? Number(payload.vehicleYear) : null,
      vehicleType: payload.vehicleType || null,
      status: 'pending',
    })

    return response.ok({
      success: true,
      message: 'Cadastro enviado com sucesso e está na fila de aprovação!',
    })
  }
}
