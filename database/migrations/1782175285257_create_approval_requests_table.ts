import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'approval_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.integer('employee_id').unsigned().references('id').inTable('employees').onDelete('SET NULL')
      table.string('cpf', 20).notNullable()
      table.string('normalized_cpf', 11).notNullable().index()
      table.string('full_name', 180).notNullable()
      table.date('birth_date').nullable()
      table.string('phone', 32).nullable()
      table.string('alternate_phone', 32).nullable()
      table.string('email', 254).nullable()
      table.string('photo_path', 500).nullable()
      table.string('company_name', 160).nullable()
      table.string('role_name', 140).nullable()
      
      // Vehicle details submitted
      table.string('vehicle_plate', 12).nullable()
      table.string('vehicle_manufacturer', 80).nullable()
      table.string('vehicle_model', 100).nullable()
      table.string('vehicle_color', 40).nullable()
      table.integer('vehicle_year').nullable()
      table.string('vehicle_type', 40).nullable()

      // Metadata
      table.string('status', 20).notNullable().defaultTo('pending').index() // 'pending', 'approved', 'rejected'
      table.text('rejection_reason').nullable()

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}