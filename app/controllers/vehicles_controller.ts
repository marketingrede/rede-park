import Employee from '#models/employee'
import Vehicle from '#models/vehicle'
import { vehicleValidator } from '#validators/redepark'
import { normalizePlate, normalizeSearchText } from '#services/normalization_service'
import { storeUploadedImage } from '#services/upload_storage_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class VehiclesController {
  async index({ request, inertia }: HttpContext) {
    const queryText = normalizeSearchText(request.input('q', ''))
    const status = String(request.input('status', 'active'))
    const normalizedPlate = normalizePlate(queryText)
    const employees = await Employee.query()
      .select(['id', 'full_name'])
      .where('status', 'active')
      .orderBy('full_name', 'asc')

    const vehicles = await Vehicle.query()
      .if(status !== 'all', (query) => query.where('status', status))
      .if(queryText.length > 0, (query) => {
        query.where((builder) => {
          builder
            .where('normalized_plate', 'like', `%${normalizedPlate}%`)
            .orWhere('manufacturer', 'like', `%${queryText}%`)
            .orWhere('model', 'like', `%${queryText}%`)
            .orWhere('color', 'like', `%${queryText}%`)
            .orWhere('year', Number(queryText) || -1)
            .orWhereIn('employee_id', (subquery) => {
              subquery
                .from('employees')
                .select('id')
                .where('normalized_name', 'like', `%${queryText}%`)
            })
        })
      })
      .orderBy('license_plate', 'asc')
      .limit(1000) // Aumentando o limite para paginação client-side rica

    return inertia.render(
      'vehicles/index' as never,
      {
        filters: { q: request.input('q', ''), status },
        vehicles,
        employees,
      } as never
    )
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(vehicleValidator)
    const photo = request.file('photo', { extnames: ['jpg', 'jpeg', 'png', 'webp'], size: '3mb' })
    const photoPath = await storeUploadedImage(photo, 'vehicles')

    await Vehicle.create({
      ...payload,
      normalizedPlate: normalizePlate(payload.licensePlate),
      licensePlate: normalizePlate(payload.licensePlate),
      status: payload.status ?? 'active',
      photoPath,
    })

    session.flash('success', 'Veiculo cadastrado.')
    return response.redirect().toPath('/veiculos')
  }

  async update({ params, request, response, session }: HttpContext) {
    const vehicle = await Vehicle.findOrFail(params.id)
    const payload = await request.validateUsing(vehicleValidator)
    const photo = request.file('photo', { extnames: ['jpg', 'jpeg', 'png', 'webp'], size: '3mb' })
    const photoPath = await storeUploadedImage(photo, 'vehicles')

    vehicle.merge({
      ...payload,
      normalizedPlate: normalizePlate(payload.licensePlate),
      licensePlate: normalizePlate(payload.licensePlate),
      status: payload.status ?? vehicle.status,
      photoPath: photoPath ?? vehicle.photoPath,
    })
    await vehicle.save()

    session.flash('success', 'Veiculo atualizado.')
    return response.redirect().toPath('/veiculos')
  }
}
