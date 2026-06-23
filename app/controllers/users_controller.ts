import User from '#models/user'
import { userManagementValidator } from '#validators/redepark'
import { auditLog } from '#services/audit_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class UsersController {
  async index({ inertia }: HttpContext) {
    const users = await User.query().orderBy('full_name', 'asc')
    return inertia.render('users/index' as never, { users } as never)
  }

  async store({ request, auth, response, session }: HttpContext) {
    const payload = await request.validateUsing(userManagementValidator)

    if (!payload.password) {
      session.flash('error', 'Informe uma senha inicial.')
      return response.redirect().toPath('/usuarios')
    }

    const newUser = await User.create(payload)
    await auditLog({
      user: auth.user,
      action: 'create',
      entityType: 'user',
      entityId: newUser.id,
      newValues: { email: newUser.email, role: newUser.role },
      ip: request.ip(),
    })

    session.flash('success', 'Usuario criado.')
    return response.redirect().toPath('/usuarios')
  }

  async update({ params, request, auth, response, session }: HttpContext) {
    const user = await User.findOrFail(params.id)
    const payload = await request.validateUsing(userManagementValidator)

    const oldValues = {
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
    }

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
    await auditLog({
      user: auth.user,
      action: 'update',
      entityType: 'user',
      entityId: user.id,
      oldValues,
      newValues: { email: user.email, role: user.role, status: user.status },
      ip: request.ip(),
    })

    session.flash('success', 'Usuario atualizado.')
    return response.redirect().toPath('/usuarios')
  }
}
