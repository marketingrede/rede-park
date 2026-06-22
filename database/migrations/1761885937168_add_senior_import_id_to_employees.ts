import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'employees'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table
        .integer('senior_import_id')
        .unsigned()
        .references('id')
        .inTable('senior_imports')
        .onDelete('SET NULL')
        .nullable()
        .index()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropForeign('senior_import_id')
      table.dropColumn('senior_import_id')
    })
  }
}
