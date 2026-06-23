import { BaseSeeder } from '@adonisjs/lucid/seeders'
import User from '#models/user'

export default class extends BaseSeeder {
  async run() {
    const adminEmail = 'admin@redepark.com.br'

    // Check if the admin user already exists
    const existingUser = await User.findBy('email', adminEmail)
    if (existingUser) {
      existingUser.fullName = 'Administrador'
      existingUser.role = 'admin'
      existingUser.status = 'active'
      existingUser.password = 'RedeParkAdmin2026!' // Will trigger the @beforeSave hook to hash
      await existingUser.save()
      return
    }

    await User.create({
      email: adminEmail,
      password: 'RedeParkAdmin2026!', // Will trigger the @beforeSave hook to hash
      fullName: 'Administrador',
      role: 'admin',
      status: 'active',
    })
  }
}
