import { ContactAttemptSchema } from '#database/schema'
import { belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'
import Visitor from '#models/visitor'

export default class ContactAttempt extends ContactAttemptSchema {
  @belongsTo(() => Employee)
  declare employee: BelongsTo<typeof Employee>

  @belongsTo(() => Visitor)
  declare visitor: BelongsTo<typeof Visitor>
}
