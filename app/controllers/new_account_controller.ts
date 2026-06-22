import User from '#models/user'
import { signupValidator } from '#validators/user'
import type { HttpContext } from '@adonisjs/core/http'

export default class NewAccountController {
  async create({ inertia, response, session }: HttpContext) {
    const existingUser = await User.query().first()
    if (existingUser) {
      session.flash('error', 'O cadastro inicial ja foi criado. Entre com seu usuario.')
      return response.redirect().toRoute('session.create')
    }

    return inertia.render('auth/signup', {})
  }

  async store({ request, response, auth, session }: HttpContext) {
    const existingUser = await User.query().first()
    if (existingUser) {
      session.flash('error', 'Novos usuarios devem ser criados por um admin.')
      return response.redirect().toRoute('session.create')
    }

    const payload = await request.validateUsing(signupValidator)
    const user = await User.create({ ...payload, role: 'admin', status: 'active' })

    await auth.use('web').login(user)
    response.redirect().toRoute('home')
  }
}
