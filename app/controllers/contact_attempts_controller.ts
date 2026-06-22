import ContactAttempt from '#models/contact_attempt'
import Employee from '#models/employee'
import { contactAttemptValidator } from '#validators/redepark'
import { buildWhatsAppUrl } from '#services/whatsapp_link_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class ContactAttemptsController {
  async store({ request, response, auth, session }: HttpContext) {
    const payload = await request.validateUsing(contactAttemptValidator)
    const employee = await Employee.findOrFail(payload.employeeId)
    const wantsJson = request.header('accept')?.includes('application/json') ?? false

    if (!payload.targetPhone) {
      if (wantsJson) {
        return response.badRequest({ error: 'Este colaborador ainda nao tem telefone.' })
      }

      session.flash('error', 'Este colaborador ainda nao tem telefone.')
      return response.redirect().back()
    }

    const whatsappUrl = buildWhatsAppUrl(payload.targetPhone, payload.message)
    await ContactAttempt.create({
      employeeId: employee.id,
      userId: auth.user?.id ?? null,
      targetPhone: payload.targetPhone,
      message: payload.message,
      whatsappUrl,
      status: 'opened',
    })

    if (wantsJson) {
      return response.ok({ whatsappUrl })
    }

    return response.redirect().toPath(whatsappUrl)
  }
}
