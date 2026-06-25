import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    const users = [
      {
        email: 'admin@redepark.com.br',
        password: 'RedeParkAdmin2026!',
        fullName: 'Administrador',
        role: 'admin',
      },
      {
        email: 'porteiro@redepark.com.br',
        password: 'RedeParkPorteiro2026!',
        fullName: 'Portaria',
        role: 'operator',
      },
    ]

    for (const userData of users) {
      const existingUser = await User.findBy('email', userData.email)

      if (existingUser) {
        existingUser.fullName = userData.fullName
        existingUser.role = userData.role
        existingUser.status = 'active'
        existingUser.password = userData.password
        await existingUser.save()
        continue
      }

      await User.create({
        ...userData,
        status: 'active',
      })
    }

    await User.query().where('email', 'admin@test.com').delete()
  }
}
