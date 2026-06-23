import { EmployeeSchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Vehicle from '#models/vehicle'

export default class Employee extends EmployeeSchema {
  @hasMany(() => Vehicle)
  declare vehicles: HasMany<typeof Vehicle>

  get displayCompany() {
    return this.companyName || 'Sem empresa informada'
  }

  get displayPhone() {
    return this.phone || this.alternatePhone || 'Sem telefone'
  }
}
