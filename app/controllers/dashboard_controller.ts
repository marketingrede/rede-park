import ContactAttempt from '#models/contact_attempt'
import Employee from '#models/employee'
import SeniorImport from '#models/senior_import'
import Vehicle from '#models/vehicle'
import Visitor from '#models/visitor'
import type { HttpContext } from '@adonisjs/core/http'

async function countRows(
  model: typeof Employee | typeof Vehicle | typeof Visitor | typeof SeniorImport
) {
  const result = await model.query().count('* as total').first()
  return Number(result?.$extras.total ?? 0)
}

export default class DashboardController {
  async index({ inertia }: HttpContext) {
    const activeVisitors = await Visitor.query().whereNull('exited_at').count('* as total').first()
    const recentImports = await SeniorImport.query().orderBy('created_at', 'desc').limit(5)
    const recentContacts = await ContactAttempt.query().orderBy('created_at', 'desc').limit(5)

    return inertia.render(
      'dashboard' as never,
      {
        metrics: {
          employees: await countRows(Employee),
          vehicles: await countRows(Vehicle),
          activeVisitors: Number(activeVisitors?.$extras.total ?? 0),
          imports: await countRows(SeniorImport),
        },
        recentImports,
        recentContacts,
      } as never
    )
  }
}
