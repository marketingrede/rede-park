import { SeniorImportSchema } from '#database/schema'
import { hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Employee from '#models/employee'

export default class SeniorImport extends SeniorImportSchema {
  @hasMany(() => Employee)
  declare employees: HasMany<typeof Employee>

  get errorList(): string[] {
    if (!this.errorsJson) {
      return []
    }

    try {
      const parsed = JSON.parse(this.errorsJson)
      return Array.isArray(parsed) ? parsed.map((error) => String(error)) : []
    } catch {
      return ['Nao foi possivel ler os erros desta importacao.']
    }
  }
}
