import type { HttpContext } from '@adonisjs/core/http'
import ApprovalRequest from '#models/approval_request'
import Employee from '#models/employee'
import Vehicle from '#models/vehicle'
import { normalizeSearchText } from '#services/normalization_service'
import { auditLog } from '#services/audit_service'

export default class ApprovalsController {
  async index({ inertia }: HttpContext) {
    try {
      const pending = await ApprovalRequest.query()
        .where('status', 'pending')
        .preload('employee')
        .orderBy('createdAt', 'desc')
      return inertia.render('admin/approvals/index' as never, { approvals: pending } as never)
    } catch (error: any) {
      if (error.message?.includes('no such table') || error.code === 'SQLITE_ERROR') {
        return inertia.render('admin/approvals/index' as never, { approvals: [] } as never)
      }
      throw error
    }
  }

  async approve({ params, request, auth, response, session }: HttpContext) {
    const approvalRequest = await ApprovalRequest.findOrFail(params.id)

    if (approvalRequest.status !== 'pending') {
      session.flash('error', 'Esta solicitação já foi processada.')
      return response.redirect('/usuarios/aprovacoes')
    }

    const db = await import('@adonisjs/lucid/services/db')
    await db.default.transaction(async () => {
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
          photoData: approvalRequest.photoData || employee.photoData,
          photoMime: approvalRequest.photoMime || employee.photoMime,
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
          photoData: approvalRequest.photoData,
          photoMime: approvalRequest.photoMime,
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
    return response.redirect('/usuarios/aprovacoes')
  }

  async reject({ params, request, auth, response, session }: HttpContext) {
    const approval = await ApprovalRequest.findOrFail(params.id)
    const { reason } = request.only(['reason'])

    if (approval.status !== 'pending') {
      session.flash('error', 'Esta solicitação já foi processada.')
      return response.redirect('/usuarios/aprovacoes')
    }

    approval.status = 'rejected'
    approval.rejectionReason = reason || 'Rejeitado pelo administrador.'
    await approval.save()

    // LGPD Cleanup: photo data is stored in DB, no file to delete

    await auditLog({
      user: auth.user,
      action: 'reject',
      entityType: 'approval_request',
      entityId: approval.id,
      newValues: { reason: approval.rejectionReason },
      ip: request.ip(),
    })

    session.flash('success', 'Solicitação rejeitada e arquivos descartados.')
    return response.redirect('/usuarios/aprovacoes')
  }
}
