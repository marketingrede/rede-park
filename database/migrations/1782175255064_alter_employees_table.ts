import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.string('cpf', 20).nullable()
      table.string('normalized_cpf', 11).nullable().unique().index()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('cpf')
      table.dropColumn('normalized_cpf')
    })
  }
}