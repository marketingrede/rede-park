import { EmployeeSchema } from '#database/schema'

export default class Employee extends EmployeeSchema {
  get displayCompany() {
    return this.companyName || 'Sem empresa informada'
  }

  get displayPhone() {
    return this.phone || this.alternatePhone || 'Sem telefone'
  }
}
