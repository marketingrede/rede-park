import Employee from '#models/employee'
import Vehicle from '#models/vehicle'
import { employeeValidator } from '#validators/redepark'
import { normalizeDigits, normalizeSearchText } from '#services/normalization_service'
import { storeUploadedImage } from '#services/upload_storage_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class EmployeesController {
  async index({ request, inertia }: HttpContext) {
    const queryText = normalizeSearchText(request.input('q', ''))
    const status = String(request.input('status', 'active'))
    const company = String(request.input('company', 'all'))

    const employees = await Employee.query()
      .if(status !== 'all', (query) => query.where('status', status))
      .if(company !== 'all', (query) => query.where('company_name', company))
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
      .limit(1000)

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
        filters: { q: request.input('q', ''), status, company },
        employees,
        vehicles,
        companies,
      } as never
    )
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(employeeValidator)
    const photo = request.file('photo', { extnames: ['jpg', 'jpeg', 'png', 'webp'], size: '3mb' })
    const photoPath = await storeUploadedImage(photo, 'employees')

    await Employee.create({
      ...payload,
      normalizedName: normalizeSearchText(payload.fullName),
      phone: payload.phone ? normalizeDigits(payload.phone) : null,
      alternatePhone: payload.alternatePhone ? normalizeDigits(payload.alternatePhone) : null,
      photoPath,
      status: payload.status ?? 'active',
    })

    session.flash('success', 'Colaborador cadastrado.')
    return response.redirect().toPath('/colaboradores')
  }

  async update({ params, request, response, session }: HttpContext) {
    const employee = await Employee.findOrFail(params.id)
    const payload = await request.validateUsing(employeeValidator)
    const photo = request.file('photo', { extnames: ['jpg', 'jpeg', 'png', 'webp'], size: '3mb' })
    const photoPath = await storeUploadedImage(photo, 'employees')

    employee.merge({
      ...payload,
      normalizedName: normalizeSearchText(payload.fullName),
      phone: payload.phone ? normalizeDigits(payload.phone) : null,
      alternatePhone: payload.alternatePhone ? normalizeDigits(payload.alternatePhone) : null,
      photoPath: photoPath ?? employee.photoPath,
      status: payload.status ?? employee.status,
    })
    await employee.save()

    session.flash('success', 'Colaborador atualizado.')
    return response.redirect().toPath('/colaboradores')
  }

  async bulkDestroy({ request, response, session }: HttpContext) {
    const ids = request.input('ids', []) as number[]
    if (!Array.isArray(ids) || ids.length === 0) {
      session.flash('error', 'Selecione pelo menos um colaborador para excluir.')
      return response.redirect().back()
    }

    let deletedCount = 0
    for (const id of ids) {
      const employee = await Employee.find(id)
      if (employee) {
        await employee.delete()
        deletedCount++
      }
    }

    session.flash('success', `${deletedCount} colaborador(es) excluído(s) com sucesso.`)
    return response.redirect().toPath('/colaboradores')
  }
}
