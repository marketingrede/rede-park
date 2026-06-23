import { VehicleSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'

export default class Vehicle extends VehicleSchema {
  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>
}
