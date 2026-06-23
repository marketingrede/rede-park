import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.createTable('audit_logs', (table) => {
      table.increments('id').notNullable()
      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('SET NULL')
      table.string('action', 40).notNullable().index()
      table.string('entity_type', 60).nullable().index()
      table.integer('entity_id').unsigned().nullable()
      table.text('old_values').nullable()
      table.text('new_values').nullable()
      table.string('ip_address', 45).nullable()
      table.timestamp('created_at').notNullable()
    })
  }

  async down() {
    this.schema.dropTable('audit_logs')
  }
}
