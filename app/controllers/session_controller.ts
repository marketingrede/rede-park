import User from '#models/user'
import { auditLog } from '#services/audit_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class SessionController {
  async create({ inertia }: HttpContext) {
    return inertia.render('auth/login', {})
  }

  async store({ request, auth, response }: HttpContext) {
    const { email, password } = request.all()
    const user = await User.verifyCredentials(email, password)

    await auth.use('web').login(user)
    await auditLog({ user, action: 'login', ip: request.ip() })
    return response.redirect().toRoute('home')
  }

  async destroy({ auth, request, response }: HttpContext) {
    const user = auth.user
    await auth.use('web').logout()
    await auditLog({ user, action: 'logout', ip: request.ip() })
    return response.redirect().toRoute('session.create')
  }
}
