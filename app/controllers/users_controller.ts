import User from '#models/user'
import { userManagementValidator } from '#validators/redepark'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index({ inertia }: HttpContext) {
    const users = await User.query().orderBy('full_name', 'asc')
    return inertia.render('users/index' as never, { users } as never)
  }

  async store({ request, response, session }: HttpContext) {
    const payload = await request.validateUsing(userManagementValidator)

    if (!payload.password) {
      session.flash('error', 'Informe uma senha inicial.')
      return response.redirect().toPath('/usuarios')
    }

    await User.create(payload)

    session.flash('success', 'Usuario criado.')
    return response.redirect().toPath('/usuarios')
  }

  async update({ params, request, response, session }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const payload = await request.validateUsing(userManagementValidator)

    user.merge({
      fullName: payload.fullName,
      email: payload.email,
      role: payload.role,
      status: payload.status,
    })

    if (payload.password) {
      user.password = payload.password
    }

    await user.save()
    session.flash('success', 'Usuario atualizado.')
    return response.redirect().toPath('/usuarios')
  }
}
