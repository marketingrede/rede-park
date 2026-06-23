import type { HttpContext } from '@adonisjs/core/http'
import ApprovalRequest from '#models/approval_request'
import Employee from '#models/employee'
import Vehicle from '#models/vehicle'
import { normalizeSearchText } from '#services/normalization_service'
import { getWritableStoragePath } from '#services/upload_storage_service'
import { auditLog } from '#services/audit_service'
import db from '@adonisjs/lucid/services/db'
import { unlink } from 'node:fs/promises'

export default class ApprovalsController {
  async index({ inertia }: HttpContext) {
    const pending = await ApprovalRequest.query()
      .where('status', 'pending')
      .preload('employee')
      .orderBy('createdAt', 'desc')
    return inertia.render('admin/approvals/index' as never, { approvals: pending } as never)
  }

  async approve({ params, request, auth, response, session }: HttpContext) {
    const approvalRequest = await ApprovalRequest.findOrFail(params.id)

    if (approvalRequest.status !== 'pending') {
      session.flash('error', 'Esta solicitação já foi processada.')
      return response.redirect().back()
    }

    await db.transaction(async () => {
      let employee: Employee

      if (approvalRequest.employeeId) {
        employee = await Employee.findOrFail(approvalRequest.employeeId)
        employee.merge({
          fullName: approvalRequest.fullName,
          normalizedName: normalizeSearchText(approvalRequest.fullName),
          birthDate: approvalRequest.birthDate,
          phone: approvalRequest.phone || employee.phone,
          alternatePhone: approvalRequest.alternatePhone || employee.alternatePhone,
          email: approvalRequest.email || employee.email,
          photoPath: approvalRequest.photoPath || employee.photoPath,
          companyName: approvalRequest.companyName || employee.companyName,
          roleName: approvalRequest.roleName || employee.roleName,
          cpf: approvalRequest.cpf,
          normalizedCpf: approvalRequest.normalizedCpf,
        })
        await employee.save()
      } else {
        employee = await Employee.create({
          fullName: approvalRequest.fullName,
          normalizedName: normalizeSearchText(approvalRequest.fullName),
          birthDate: approvalRequest.birthDate,
          phone: approvalRequest.phone,
          alternatePhone: approvalRequest.alternatePhone,
          email: approvalRequest.email,
          photoPath: approvalRequest.photoPath,
          companyName: approvalRequest.companyName,
          roleName: approvalRequest.roleName,
          cpf: approvalRequest.cpf,
          normalizedCpf: approvalRequest.normalizedCpf,
          status: 'active',
        })
      }

      if (approvalRequest.vehiclePlate) {
        const existingVehicle = await Vehicle.query()
          .where('normalized_plate', approvalRequest.vehiclePlate)
          .first()
        if (existingVehicle) {
          existingVehicle.merge({
            employeeId: employee.id,
            licensePlate: approvalRequest.vehiclePlate,
            manufacturer: approvalRequest.vehicleManufacturer || existingVehicle.manufacturer,
            model: approvalRequest.vehicleModel || existingVehicle.model,
            color: approvalRequest.vehicleColor || existingVehicle.color,
            year: approvalRequest.vehicleYear || existingVehicle.year,
            vehicleType: approvalRequest.vehicleType || existingVehicle.vehicleType,
          })
          await existingVehicle.save()
        } else {
          await Vehicle.create({
            employeeId: employee.id,
            licensePlate: approvalRequest.vehiclePlate,
            normalizedPlate: approvalRequest.vehiclePlate,
            manufacturer: approvalRequest.vehicleManufacturer,
            model: approvalRequest.vehicleModel,
            color: approvalRequest.vehicleColor,
            year: approvalRequest.vehicleYear,
            vehicleType: approvalRequest.vehicleType || 'car',
            status: 'active',
          })
        }
      }

      approvalRequest.status = 'approved'
      await approvalRequest.save()
    })

    await auditLog({
      user: auth.user,
      action: 'approve',
      entityType: 'approval_request',
      entityId: approvalRequest.id,
      ip: request.ip(),
    })

    session.flash('success', 'Solicitação aprovada com sucesso!')
    return response.redirect().back()
  }

  async reject({ params, request, auth, response, session }: HttpContext) {
    const approval = await ApprovalRequest.findOrFail(params.id)
    const { reason } = request.only(['reason'])

    if (approval.status !== 'pending') {
      session.flash('error', 'Esta solicitação já foi processada.')
      return response.redirect().back()
    }

    approval.status = 'rejected'
    approval.rejectionReason = reason || 'Rejeitado pelo administrador.'
    await approval.save()

    await auditLog({
      user: auth.user,
      action: 'reject',
      entityType: 'approval_request',
      entityId: approval.id,
      newValues: { reason: approval.rejectionReason },
      ip: request.ip(),
    })

    // LGPD Cleanup: Delete the temporary uploaded file to protect privacy
    if (approval.photoPath) {
      try {
        const parts = approval.photoPath.split('/')
        const fileName = parts[parts.length - 1]
        const filePath = getWritableStoragePath('uploads', 'employees', fileName)
        await unlink(filePath)
      } catch (err) {
        // Ignored if file doesn't exist
      }
    }

    session.flash('success', 'Solicitação rejeitada e arquivos descartados.')
    return response.redirect().back()
  }
}
