import type { HttpContext } from '@adonisjs/core/http'
import Employee from '#models/employee'
import ApprovalRequest from '#models/approval_request'
import { storeUploadedImage } from '#services/upload_storage_service'
import { normalizePhone, normalizePlate } from '#services/normalization_service'
import { DateTime } from 'luxon'

export default class PublicCollaboratorsController {
  async showForm({ inertia }: HttpContext) {
    return inertia.render('public/collaborator_register', {})
  }

  async lookup({ request, response }: HttpContext) {
    const { cpf, birthDate } = request.only(['cpf', 'birthDate'])

    if (!cpf) {
      return response.badRequest({ message: 'CPF é obrigatório.' })
    }

    const cleanCpf = String(cpf).replace(/\D/g, '')
    const employee = await Employee.query().where('normalized_cpf', cleanCpf).first()

    if (!employee) {
      return response.ok({ found: false })
    }

    // If employee has a birthDate in our records, enforce matching it for security
    if (employee.birthDate && birthDate) {
      const inputBirthDate = DateTime.fromISO(birthDate)
      const matches = employee.birthDate.hasSame(inputBirthDate, 'day')
      if (!matches) {
        return response.badRequest({ message: 'Data de nascimento não confere com o cadastro.' })
      }
    } else if (employee.birthDate && !birthDate) {
      return response.badRequest({ message: 'Data de nascimento é necessária para validar este CPF.' })
    }

    // Mask name for privacy (LGPD compliance)
    const nameParts = employee.fullName.split(' ')
    const maskedName = nameParts
      .map((part, index) => {
        if (index === 0 || index === nameParts.length - 1) return part
        return part[0] + '*'.repeat(part.length - 1)
      })
      .join(' ')

    return response.ok({
      found: true,
      employee: {
        id: employee.id,
        fullName: maskedName,
        companyName: employee.companyName,
        roleName: employee.roleName,
        email: employee.email,
        phone: employee.phone,
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
    const cleanCpf = String(payload.cpf).replace(/\D/g, '')

    // Create the approval request
    await ApprovalRequest.create({
      employeeId: payload.employeeId ? Number(payload.employeeId) : null,
      cpf: payload.cpf,
      normalizedCpf: cleanCpf,
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
