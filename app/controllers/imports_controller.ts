import Employee from '#models/employee'
import SeniorImport from '#models/senior_import'
import SeniorImportService from '#services/senior_import_service'
import { getWritableStoragePath } from '#services/upload_storage_service'
import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import { randomUUID } from 'node:crypto'
import { mkdir, unlink } from 'node:fs/promises'
import path from 'node:path'

export default class ImportsController {
  async index({ inertia }: HttpContext) {
    const imports = await SeniorImport.query().orderBy('created_at', 'desc').limit(30)
    return inertia.render('imports/index' as never, { imports } as never)
  }

  async store({ request, response, session }: HttpContext) {
    const seniorFile = request.file('seniorFile', {
      extnames: ['xlsx', 'xls', 'csv', 'json'],
      size: '20mb',
    })

    if (!seniorFile || !seniorFile.isValid) {
      session.flash('error', 'Envie um arquivo XLSX, CSV ou JSON valido.')
      return response.redirect().toPath('/importacoes')
    }

    const uploadDirectory = getWritableStoragePath('senior', 'uploads')
    await mkdir(uploadDirectory, { recursive: true })
    const fileName = `${randomUUID()}-${seniorFile.clientName}`
    await seniorFile.move(uploadDirectory, { name: fileName, overwrite: false })

    const importService = new SeniorImportService()
    const result = await importService.importFile(path.join(uploadDirectory, fileName))

    if (result.importRecord.status === 'failed') {
      session.flash('error', 'A importacao falhou. Veja o historico para detalhes.')
    } else {
      session.flash(
        'success',
        `Importacao concluida. Novos: ${result.importedCount}. Atualizados: ${result.updatedCount}.`
      )
    }

    return response.redirect().toPath('/importacoes')
  }

  async storeAuxiliary({ request, response, session }: HttpContext) {
    const auxiliaryFile = request.file('auxiliaryFile', {
      extnames: ['xlsx', 'xls', 'csv', 'json'],
      size: '20mb',
    })

    if (!auxiliaryFile || !auxiliaryFile.isValid) {
      session.flash('error', 'Envie um arquivo XLSX, CSV ou JSON válido.')
      return response.redirect().toPath('/importacoes')
    }

    const uploadDirectory = getWritableStoragePath('senior', 'uploads')
    await mkdir(uploadDirectory, { recursive: true })
    const fileName = `${randomUUID()}-${auxiliaryFile.clientName}`
    await auxiliaryFile.move(uploadDirectory, { name: fileName, overwrite: false })

    const importService = new SeniorImportService()
    const result = await importService.importAuxiliaryFile(path.join(uploadDirectory, fileName))

    if (result.importRecord.status === 'failed') {
      session.flash('error', 'A importação falhou. Veja o histórico para detalhes.')
    } else {
      session.flash(
        'success',
        `Importação de veículos/contatos concluída. Vinculados/Atualizados: ${result.updatedCount}. Erros/Ignorados: ${result.errorCount}.`
      )
    }

    return response.redirect().toPath('/importacoes')
  }

  async downloadTemplate({ params, response }: HttpContext) {
    const type = params.type
    if (type === 'senior') {
      const csvContent =
        '\uFEFFNome;Nascimento;C.Custo;Descrição (C.Custo);Cargo;Empresa\nJoão da Silva;01/01/1990;1020;TI;Desenvolvedor;Rede Park\nMaria Souza;15/05/1985;1030;RH;Analista de RH;Rede Park'
      response.header('Content-Type', 'text/csv; charset=utf-8')
      response.header('Content-Disposition', 'attachment; filename="modelo_cadastro_senior.csv"')
      return response.send(csvContent)
    } else if (type === 'auxiliary') {
      const csvContent =
        '\uFEFFNome;Telefone;Placa;Marca;Modelo;Cor;Ano\nJoão da Silva;11999998888;ABC1D23;Ford;Fiesta;Preto;2015\nMaria Souza;11988887777;XYZ9A87;Chevrolet;Onix;Prata;2019'
      response.header('Content-Type', 'text/csv; charset=utf-8')
      response.header('Content-Disposition', 'attachment; filename="modelo_veiculos_contatos.csv"')
      return response.send(csvContent)
    }

    return response.badRequest('Modelo inválido')
  }

  async bulkDestroy({ request, response, session }: HttpContext) {
    const ids = request.input('ids', []) as number[]
    if (!Array.isArray(ids) || ids.length === 0) {
      session.flash('error', 'Selecione pelo menos uma importação para excluir.')
      return response.redirect().back()
    }

    const deletedCount = await db.transaction(async (trx) => {
      const records = await SeniorImport.query({ client: trx }).whereIn('id', ids)

      for (const record of records) {
        await Employee.query({ client: trx }).where('senior_import_id', record.id).delete()

        if (record.sourcePath) {
          try {
            await unlink(record.sourcePath)
          } catch {
            // Ignore file delete errors if it doesn't exist
          }
        }

        await record.delete()
      }

      return records.length
    })

    session.flash('success', `${deletedCount} importação(ões) excluída(s) com sucesso.`)
    return response.redirect().toPath('/importacoes')
  }
}
