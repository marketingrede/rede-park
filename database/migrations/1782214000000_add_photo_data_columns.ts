import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('employees', (table) => {
      table.text('photo_data').nullable()
      table.string('photo_mime', 30).nullable()
    })

    this.schema.alterTable('vehicles', (table) => {
      table.text('photo_data').nullable()
      table.string('photo_mime', 30).nullable()
    })

    this.schema.alterTable('approval_requests', (table) => {
      table.text('photo_data').nullable()
      table.string('photo_mime', 30).nullable()
    })
  }

  async down() {
    this.schema.alterTable('employees', (table) => {
      table.dropColumn('photo_data')
      table.dropColumn('photo_mime')
    })

    this.schema.alterTable('vehicles', (table) => {
      table.dropColumn('photo_data')
      table.dropColumn('photo_mime')
    })

    this.schema.alterTable('approval_requests', (table) => {
      table.dropColumn('photo_data')
      table.dropColumn('photo_mime')
    })
  }
}
