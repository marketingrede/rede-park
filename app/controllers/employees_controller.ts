import Employee from '#models/employee'
import Vehicle from '#models/vehicle'
import { employeeValidator } from '#validators/redepark'
import { normalizeDigits, normalizeSearchText } from '#services/normalization_service'
import { storeUploadedImage } from '#services/upload_storage_service'
import { auditLog } from '#services/audit_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class EmployeesController {
  async index({ request, inertia }: HttpContext) {
    const queryText = normalizeSearchText(request.input('q', ''))
    const status = String(request.input('status', 'active'))
    const company = String(request.input('company', 'all'))
    const birthDate = String(request.input('birthDate', ''))

    const employees = await Employee.query()
      .if(status !== 'all', (query) => query.where('status', status))
      .if(company !== 'all', (query) => query.where('company_name', company))
      .if(birthDate.length > 0, (query) => query.where('birth_date', birthDate))
      .if(queryText.length > 0, (query) => {
        query.where((builder) => {
          builder
            .where('normalized_name', 'like', `%${queryText}%`)
            .orWhere('role_name', 'like', `%${queryText}%`)
            .orWhere('company_name', 'like', `%${queryText}%`)
            .orWhere('cost_center_code', 'like', `%${queryText}%`)
            .orWhere('cost_center_description', 'like', `%${queryText}%`)
            .orWhere('phone', 'like', `%${normalizeDigits(queryText)}%`)
        })
      })
      .orderBy('full_name', 'asc')
      .limit(100)

    const employeeIds = employees.map((employee) => employee.id)
    const vehicles =
      employeeIds.length > 0
        ? await Vehicle.query().whereIn('employee_id', employeeIds).orderBy('license_plate', 'asc')
        : []

    const companiesList = await Employee.query()
      .whereNotNull('company_name')
      .distinct('company_name')
      .orderBy('company_name', 'asc')
    const companies = companiesList.map((c) => c.companyName).filter(Boolean) as string[]

    return inertia.render(
      'employees/index' as never,
      {
        filters: { q: request.input('q', ''), status, company, birthDate },
        employees,
        vehicles,
        companies,
      } as never
    )
  }

  async store({ request, auth, response, session }: HttpContext) {
    const payload = await request.validateUsing(employeeValidator)
    const photo = request.file('photo', { extnames: ['jpg', 'jpeg', 'png', 'webp'], size: '2mb' })
    const photoResult = await storeUploadedImage(photo, 'employees')

    const employee = await Employee.create({
      ...payload,
      normalizedName: normalizeSearchText(payload.fullName),
      phone: payload.phone ? normalizeDigits(payload.phone) : null,
      alternatePhone: payload.alternatePhone ? normalizeDigits(payload.alternatePhone) : null,
      photoData: photoResult?.photoData ?? null,
      photoMime: photoResult?.photoMime ?? null,
      status: payload.status ?? 'active',
    })

    await auditLog({
      user: auth.user,
      action: 'create',
      entityType: 'employee',
      entityId: employee.id,
      newValues: { fullName: employee.fullName, companyName: employee.companyName },
      ip: request.ip(),
    })

    session.flash('success', 'Colaborador cadastrado.')
    return response.redirect().toPath('/colaboradores')
  }

  async update({ params, request, auth, response, session }: HttpContext) {
    const employee = await Employee.findOrFail(params.id)
    const payload = await request.validateUsing(employeeValidator)
    const photo = request.file('photo', { extnames: ['jpg', 'jpeg', 'png', 'webp'], size: '2mb' })
    const photoResult = await storeUploadedImage(photo, 'employees')

    const oldValues = { fullName: employee.fullName, companyName: employee.companyName }

    employee.merge({
      ...payload,
      normalizedName: normalizeSearchText(payload.fullName),
      phone: payload.phone ? normalizeDigits(payload.phone) : null,
      alternatePhone: payload.alternatePhone ? normalizeDigits(payload.alternatePhone) : null,
      photoData: photoResult?.photoData ?? employee.photoData,
      photoMime: photoResult?.photoMime ?? employee.photoMime,
      status: payload.status ?? employee.status,
    })
    await employee.save()

    await auditLog({
      user: auth.user,
      action: 'update',
      entityType: 'employee',
      entityId: employee.id,
      oldValues,
      newValues: { fullName: employee.fullName, companyName: employee.companyName },
      ip: request.ip(),
    })

    session.flash('success', 'Colaborador atualizado.')
    return response.redirect().toPath('/colaboradores')
  }

  async bulkDestroy({ request, auth, response, session }: HttpContext) {
    const ids = request.input('ids', []) as number[]
    if (!Array.isArray(ids) || ids.length === 0) {
      session.flash('error', 'Selecione pelo menos um colaborador para excluir.')
      return response.redirect().back()
    }

    const db = await import('@adonisjs/lucid/services/db')
    const deletedCount = await db.default.transaction(async (trx) => {
      const employees = await Employee.query({ client: trx }).whereIn('id', ids)
      for (const employee of employees) {
        await employee.delete()
      }
      return employees.length
    })

    await auditLog({
      user: auth.user,
      action: 'bulk_delete',
      entityType: 'employee',
      newValues: { ids },
      ip: request.ip(),
    })

    session.flash('success', `${deletedCount} colaborador(es) excluído(s) com sucesso.`)
    return response.redirect().toPath('/colaboradores')
  }
}
