import { BaseCommand } from '@adonisjs/core/ace'
import { flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import app from '@adonisjs/core/services/app'
import env from '#start/env'
import SeniorImportService from '#services/senior_import_service'
import { mkdir, readdir, rename, stat } from 'node:fs/promises'
import path from 'node:path'

export default class SeniorSync extends BaseCommand {
  static commandName = 'senior:sync'
  static description = 'Importa arquivos XLSX, CSV ou JSON exportados do Senior'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.string({ description: 'Pasta de entrada ou arquivo unico' })
  declare path?: string

  @flags.boolean({ description: 'Nao mover arquivos processados para a pasta de arquivo' })
  declare keepFiles?: boolean

  async run() {
    const sourcePath = this.resolveProjectPath(
      this.path ?? env.get('SENIOR_IMPORT_DIR') ?? 'storage/senior/inbox'
    )
    const archivePath = this.resolveProjectPath(
      env.get('SENIOR_ARCHIVE_DIR') ?? 'storage/senior/archive'
    )
    const importService = new SeniorImportService()
    const files = await this.resolveImportFiles(sourcePath)

    if (files.length === 0) {
      this.logger.info(`Nenhum arquivo Senior encontrado em ${sourcePath}`)
      return
    }

    await mkdir(archivePath, { recursive: true })

    for (const filePath of files) {
      this.logger.info(`Importando ${filePath}`)
      const result = await importService.importFile(filePath)

      this.logger.info(
        `Importacao ${result.importRecord.id}: ${result.importRecord.status}. Novos=${result.importedCount}, atualizados=${result.updatedCount}, ignorados=${result.skippedCount}, erros=${result.errorCount}`
      )

      if (!this.keepFiles && result.importRecord.status !== 'failed') {
        const destinationPath = path.join(archivePath, `${Date.now()}-${path.basename(filePath)}`)
        await rename(filePath, destinationPath)
      }
    }
  }

  private resolveProjectPath(inputPath: string) {
    return path.isAbsolute(inputPath) ? inputPath : app.makePath(inputPath)
  }

  private async resolveImportFiles(inputPath: string) {
    const supportedExtensions = new Set(['.xlsx', '.xls', '.csv', '.json'])
    const inputStats = await stat(inputPath)

    if (inputStats.isFile()) {
      return supportedExtensions.has(path.extname(inputPath).toLowerCase()) ? [inputPath] : []
    }

    const entries = await readdir(inputPath)
    return entries
      .filter((entry) => supportedExtensions.has(path.extname(entry).toLowerCase()))
      .map((entry) => path.join(inputPath, entry))
  }
}
