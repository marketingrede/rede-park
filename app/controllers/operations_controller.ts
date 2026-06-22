import Employee from '#models/employee'
import Vehicle from '#models/vehicle'
import Visitor from '#models/visitor'
import { formatPlate } from '#services/normalization_service'
import { buildVehicleContactMessage } from '#services/whatsapp_link_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class OperationsController {
  async index({ request, inertia }: HttpContext) {
    const employees = await Employee.query()
      .where('status', 'active')
      .orderBy('full_name', 'asc')
      .limit(5000)
    const vehicles = await Vehicle.query().where('status', 'active').orderBy('license_plate', 'asc')

    const visitors = await Visitor.query()
      .whereNull('exited_at')
      .orderBy('entered_at', 'desc')
      .limit(500)

    const allPast = await Visitor.query()
      .whereNotNull('exited_at')
      .orderBy('entered_at', 'desc')
      .limit(1000)

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
