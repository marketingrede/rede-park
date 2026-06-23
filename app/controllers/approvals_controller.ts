import type { HttpContext } from '@adonisjs/core/http'
import ApprovalRequest from '#models/approval_request'
import Employee from '#models/employee'
import Vehicle from '#models/vehicle'
import { normalizeSearchText } from '#services/normalization_service'
import { unlink } from 'node:fs/promises'
import app from '@adonisjs/core/services/app'

export default class ApprovalsController {
  async index({ inertia }: HttpContext) {
    const pending = await ApprovalRequest.query()
      .where('status', 'pending')
      .preload('employee')
      .orderBy('createdAt', 'desc')
    return inertia.render('admin/approvals/index' as never, { approvals: pending } as never)
  }

  async approve({ params, response, session }: HttpContext) {
    const request = await ApprovalRequest.findOrFail(params.id)

    if (request.status !== 'pending') {
      session.flash('error', 'Esta solicitação já foi processada.')
      return response.redirect().back()
    }

    let employee: Employee

    if (request.employeeId) {
      employee = await Employee.findOrFail(request.employeeId)
      employee.merge({
        fullName: request.fullName,
        normalizedName: normalizeSearchText(request.fullName),
        birthDate: request.birthDate,
        phone: request.phone || employee.phone,
        alternatePhone: request.alternatePhone || employee.alternatePhone,
        email: request.email || employee.email,
        photoPath: request.photoPath || employee.photoPath,
        companyName: request.companyName || employee.companyName,
        roleName: request.roleName || employee.roleName,
        cpf: request.cpf,
        normalizedCpf: request.normalizedCpf,
      })
      await employee.save()
    } else {
      employee = await Employee.create({
        fullName: request.fullName,
        normalizedName: normalizeSearchText(request.fullName),
        birthDate: request.birthDate,
        phone: request.phone,
        alternatePhone: request.alternatePhone,
        email: request.email,
        photoPath: request.photoPath,
        companyName: request.companyName,
        roleName: request.roleName,
        cpf: request.cpf,
        normalizedCpf: request.normalizedCpf,
        status: 'active',
      })
    }

    // Process Vehicle Details
    if (request.vehiclePlate) {
      const existingVehicle = await Vehicle.query().where('normalized_plate', request.vehiclePlate).first()
      if (existingVehicle) {
        existingVehicle.merge({
          employeeId: employee.id,
          licensePlate: request.vehiclePlate,
          manufacturer: request.vehicleManufacturer || existingVehicle.manufacturer,
          model: request.vehicleModel || existingVehicle.model,
          color: request.vehicleColor || existingVehicle.color,
          year: request.vehicleYear || existingVehicle.year,
          vehicleType: request.vehicleType || existingVehicle.vehicleType,
        })
        await existingVehicle.save()
      } else {
        await Vehicle.create({
          employeeId: employee.id,
          licensePlate: request.vehiclePlate,
          normalizedPlate: request.vehiclePlate,
          manufacturer: request.vehicleManufacturer,
          model: request.vehicleModel,
          color: request.vehicleColor,
          year: request.vehicleYear,
          vehicleType: request.vehicleType || 'car',
          status: 'active',
        })
      }
    }

    request.status = 'approved'
    await request.save()

    session.flash('success', 'Solicitação aprovada com sucesso!')
    return response.redirect().back()
  }

  async reject({ params, request, response, session }: HttpContext) {
    const approval = await ApprovalRequest.findOrFail(params.id)
    const { reason } = request.only(['reason'])

    if (approval.status !== 'pending') {
      session.flash('error', 'Esta solicitação já foi processada.')
      return response.redirect().back()
    }

    approval.status = 'rejected'
    approval.rejectionReason = reason || 'Rejeitado pelo administrador.'
    await approval.save()

    // LGPD Cleanup: Delete the temporary uploaded file to protect privacy
    if (approval.photoPath) {
      try {
        const parts = approval.photoPath.split('/')
        const fileName = parts[parts.length - 1]
        const filePath = app.makePath('storage', 'uploads', 'employees', fileName)
        await unlink(filePath)
      } catch (err) {
        // Ignored if file doesn't exist
      }
    }

    session.flash('success', 'Solicitação rejeitada e arquivos descartados.')
    return response.redirect().back()
  }
}
