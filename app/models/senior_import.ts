import { SeniorImportSchema } from '#database/schema'

export default class SeniorImport extends SeniorImportSchema {
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
