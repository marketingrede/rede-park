import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('visitors', (table) => {
      table.index('exited_at')
      table.index('entered_at')
    })

    this.schema.alterTable('vehicles', (table) => {
      table.index('employee_id')
    })

    this.schema.alterTable('contact_attempts', (table) => {
      table.index('employee_id')
      table.index('visitor_id')
    })

    this.schema.alterTable('approval_requests', (table) => {
      table.index('employee_id')
    })
  }

  async down() {
    this.schema.alterTable('visitors', (table) => {
      table.dropIndex('exited_at')
      table.dropIndex('entered_at')
    })

    this.schema.alterTable('vehicles', (table) => {
      table.dropIndex('employee_id')
    })

    this.schema.alterTable('contact_attempts', (table) => {
      table.dropIndex('employee_id')
      table.dropIndex('visitor_id')
    })

    this.schema.alterTable('approval_requests', (table) => {
      table.dropIndex('employee_id')
    })
  }
}
