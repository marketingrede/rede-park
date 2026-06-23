import Employee from '#models/employee'
import Vehicle from '#models/vehicle'
import Visitor from '#models/visitor'
import { formatPlate, normalizeSearchText, normalizePlate } from '#services/normalization_service'
import { buildVehicleContactMessage } from '#services/whatsapp_link_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class OperationsController {
  async index({ request, inertia }: HttpContext) {
    const q = request.input('q', '').trim()
    const cleanQ = normalizeSearchText(q)
    const plateQ = normalizePlate(q)

    let employeesQuery = Employee.query().where('status', 'active')

    if (cleanQ) {
      employeesQuery = employeesQuery.where((builder) => {
        builder
          .where('normalized_name', 'like', `%${cleanQ}%`)
          .orWhere('role_name', 'like', `%${cleanQ}%`)
          .orWhere('company_name', 'like', `%${cleanQ}%`)
          .orWhereExists((subquery) => {
            subquery
              .from('vehicles')
              .whereRaw('vehicles.employee_id = employees.id')
              .where('vehicles.status', 'active')
              .andWhere('vehicles.normalized_plate', 'like', `%${plateQ}%`)
          })
      })
    }

    const employees = await employeesQuery
      .orderBy('full_name', 'asc')
      .limit(50)

    const employeeIds = employees.map((e) => e.id)
    const vehicles = employeeIds.length > 0
      ? await Vehicle.query()
          .where('status', 'active')
          .whereIn('employee_id', employeeIds)
          .orderBy('license_plate', 'asc')
      : []

    const visitors = await Visitor.query()
      .whereNull('exited_at')
      .orderBy('entered_at', 'desc')
      .limit(500)

    const allPast = await Visitor.query()
      .select([
        'id',
        'full_name',
        'cpf',
        'license_plate',
        'vehicle_type',
        'manufacturer',
        'model',
        'year',
        'company_name',
      ])
      .whereNotNull('exited_at')
      .orderBy('entered_at', 'desc')
      .limit(200)

    const uniquePastMap = new Map<string, any>()
    for (const v of allPast) {
      const cpfClean = v.cpf.trim()
      if (!uniquePastMap.has(cpfClean)) {
        uniquePastMap.set(cpfClean, v.serialize())
      }
    }
    const pastVisitors = Array.from(uniquePastMap.values())

    const vehiclesByEmployee = new Map<number, Vehicle[]>()
    for (const vehicle of vehicles) {
      if (!vehicle.employeeId) {
        continue
      }
      const currentVehicles = vehiclesByEmployee.get(vehicle.employeeId) ?? []
      currentVehicles.push(vehicle)
      vehiclesByEmployee.set(vehicle.employeeId, currentVehicles)
    }

    return inertia.render(
      'operations/index' as never,
      {
        queryText: request.input('q', ''),
        employees: employees.map((employee) => {
          const employeeVehicles = vehiclesByEmployee.get(employee.id) ?? []
          const primaryVehicle = employeeVehicles[0]
          return {
            ...employee.serialize(),
            vehicles: employeeVehicles.map((vehicle) => vehicle.serialize()),
            message: buildVehicleContactMessage({
              employeeName: employee.fullName,
              vehicleLabel: primaryVehicle
                ? `${primaryVehicle.manufacturer ?? ''} ${primaryVehicle.model ?? ''}`.trim()
                : null,
              licensePlate: primaryVehicle ? formatPlate(primaryVehicle.licensePlate) : null,
            }),
          }
        }),
        visitors,
        pastVisitors,
      } as never
    )
  }
}
