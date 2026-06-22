import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle({ auth, response, session }: HttpContext, next: NextFn) {
    const user = auth.user

    if (!user || user.role !== 'admin' || user.status !== 'active') {
      session.flash('error', 'Acesso restrito aos administradores.')
      return response.redirect().toPath('/operacao')
    }

    return next()
  }
}
