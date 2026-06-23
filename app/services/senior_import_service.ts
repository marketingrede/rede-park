import Employee from '#models/employee'
import SeniorImport from '#models/senior_import'
import Vehicle from '#models/vehicle'
import { makeSeniorSourceKey, normalizeSearchText, normalizePhone, normalizePlate } from '#services/normalization_service'
import { parse as parseCsv } from 'csv-parse/sync'
import { DateTime } from 'luxon'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { readSheet } from 'read-excel-file/node'
import { z } from 'zod'

type SeniorImportSourceType = 'xlsx' | 'csv' | 'json'

type SeniorEmployeeInput = {
  fullName: string
  birthDate: string | null
  costCenterCode: string | null
  costCenterDescription: string | null
  roleName: string | null
  companyName: string | null
  raw: Record<string, unknown>
}

type SeniorImportResult = {
  importRecord: SeniorImport
  importedCount: number
  updatedCount: number
  skippedCount: number
  errorCount: number
}

const jsonEmployeeSchema = z
  .object({
    'Nome': z.unknown().optional(),
    'nome': z.unknown().optional(),
    'fullName': z.unknown().optional(),
    'Nascimento': z.unknown().optional(),
    'nascimento': z.unknown().optional(),
    'birthDate': z.unknown().optional(),
    'C.Custo': z.unknown().optional(),
    'costCenterCode': z.unknown().optional(),
    'Descrição (C.Custo)': z.unknown().optional(),
    'costCenterDescription': z.unknown().optional(),
    'Cargo': z.unknown().optional(),
    'cargo': z.unknown().optional(),
    'roleName': z.unknown().optional(),
    'Empresa': z.unknown().optional(),
    'empresa': z.unknown().optional(),
    'companyName': z.unknown().optional(),
  })
  .passthrough()

function asTrimmedString(value: unknown) {
  const cleanValue = unwrapCellValue(value)
  if (cleanValue === null || cleanValue === undefined) {
    return null
  }

  const text = String(cleanValue).trim()
  return text.length > 0 ? text : null
}

function unwrapCellValue(value: unknown): unknown {
  if (
    typeof value === 'object' &&
    value !== null &&
    'result' in value &&
    Object.hasOwn(value, 'result')
  ) {
    return (value as { result: unknown }).result
  }

  if (
    typeof value === 'object' &&
    value !== null &&
    'text' in value &&
    Object.hasOwn(value, 'text')
  ) {
    return (value as { text: unknown }).text
  }

  return value
}

function parseBirthDate(value: unknown) {
  const cleanValue = unwrapCellValue(value)
  if (!cleanValue) {
    return null
  }

  if (cleanValue instanceof Date) {
    return DateTime.fromJSDate(cleanValue).toISODate()
  }

  if (typeof cleanValue === 'number') {
    return DateTime.fromMillis((cleanValue - 25569) * 86400 * 1000, { zone: 'utc' }).toISODate()
  }

  const text = String(cleanValue).trim()
  const dateFormats = ['yyyy-MM-dd', 'dd/MM/yyyy', 'd/M/yyyy', 'dd-MM-yyyy']
  for (const format of dateFormats) {
    const parsedDate = DateTime.fromFormat(text, format)
    if (parsedDate.isValid) {
      return parsedDate.toISODate()
    }
  }

  const isoDate = DateTime.fromISO(text)
  return isoDate.isValid ? isoDate.toISODate() : null
}

function detectSourceType(filePath: string): SeniorImportSourceType {
  const extension = path.extname(filePath).toLowerCase()
  if (extension === '.xlsx' || extension === '.xls') {
    return 'xlsx'
  }
  if (extension === '.csv') {
    return 'csv'
  }
  if (extension === '.json') {
    return 'json'
  }

  throw new Error(`Formato nao suportado: ${extension}`)
}

function getHeaderValue(row: Record<string, unknown>, candidates: string[]) {
  for (const candidate of candidates) {
    if (candidate in row) {
      return row[candidate]
    }
  }

  const normalizedCandidates = candidates.map((candidate) => normalizeSearchText(candidate))
  const matchingKey = Object.keys(row).find((key) =>
    normalizedCandidates.includes(normalizeSearchText(key))
  )
  return matchingKey ? row[matchingKey] : undefined
}

function makeSeniorEmployeeInput(row: Record<string, unknown>): SeniorEmployeeInput | null {
  const parsedRow = jsonEmployeeSchema.parse(row)
  const fullName = asTrimmedString(
    getHeaderValue(parsedRow, [
      'Nome',
      'nome',
      'fullName',
      'Colaborador',
      'colaborador',
      'Funcionário',
      'funcionario',
      'Nome Completo',
      'nome completo',
    ])
  )
  if (!fullName) {
    return null
  }

  const birthDate = parseBirthDate(
    getHeaderValue(parsedRow, [
      'Nascimento',
      'nascimento',
      'birthDate',
      'Data de Nascimento',
      'data de nascimento',
      'Data',
      'data',
      'Dia',
      'dia',
      'Aniversário',
      'aniversário',
      'Aniversario',
      'aniversario',
      'D. Nasc.',
      'd. nasc.',
      'DT Nasc',
      'dt nasc',
      'Data Nasc',
      'data nasc',
      'Data nasc',
    ])
  )
  const costCenterCode = asTrimmedString(
    getHeaderValue(parsedRow, [
      'C.Custo',
      'Custo',
      'costCenterCode',
      'Centro de Custo',
      'centro de custo',
    ])
  )
  const costCenterDescription = asTrimmedString(
    getHeaderValue(parsedRow, [
      'Descrição (C.Custo)',
      'Descricao (C.Custo)',
      'costCenterDescription',
      'Descrição Centro de Custo',
      'descrição centro de custo',
      'Descrição C. Custo',
      'descrição c. custo',
    ])
  )
  const roleName = asTrimmedString(
    getHeaderValue(parsedRow, ['Cargo', 'cargo', 'roleName', 'Função', 'função', 'Funcao', 'funcao'])
  )
  const companyName = asTrimmedString(
    getHeaderValue(parsedRow, ['Empresa', 'empresa', 'companyName', 'Unidade', 'unidade'])
  )

  return {
    fullName,
    birthDate,
    costCenterCode,
    costCenterDescription,
    roleName,
    companyName,
    raw: parsedRow,
  }
}

function detectHeaderRow(rows: unknown[][]) {
  return rows.findIndex((row) => {
    const normalizedCells = row.map((cell) => normalizeSearchText(asTrimmedString(cell)))

    const hasNameHeader = normalizedCells.some((cell) => {
      return (
        cell === 'NOME' ||
        cell === 'COLABORADOR' ||
        cell === 'FUNCIONARIO' ||
        cell.includes('NOME COMPLETO')
      )
    })

    const hasDateHeader = normalizedCells.some((cell) => {
      return (
        cell === 'NASCIMENTO' ||
        cell === 'NASC' ||
        cell === 'ANIVERSARIO' ||
        cell === 'DATA' ||
        cell.includes('NASC') ||
        cell.includes('ANIV') ||
        cell.includes('NASCIMENTO')
      )
    })

    return hasNameHeader && hasDateHeader
  })
}

async function rowsFromSheet(filePath: string) {
  const sheetRows = await readSheet(filePath)
  const rows = sheetRows.map((row) => row.map((value) => unwrapCellValue(value)))

  const headerIndex = detectHeaderRow(rows)

  if (headerIndex < 0) {
    throw new Error('Nao foi possivel detectar a linha de cabecalho da planilha.')
  }

  const headers = rows[headerIndex].map((cell) => asTrimmedString(cell) ?? '')
  const records = rows.slice(headerIndex + 1).map((row) => {
    const record: Record<string, unknown> = {}
    headers.forEach((header, index) => {
      if (header) {
        record[header] = row[index] ?? null
      }
    })
    return record
  })

  return { records, headerRow: headerIndex + 1 }
}

async function rowsFromCsv(filePath: string) {
  const content = await readFile(filePath, 'utf8')
  const records = parseCsv(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  }) as Record<string, unknown>[]

  return { records, headerRow: 1 }
}

async function rowsFromJson(filePath: string) {
  const content = await readFile(filePath, 'utf8')
  const parsed = JSON.parse(content) as unknown
  const records = Array.isArray(parsed)
    ? parsed
    : typeof parsed === 'object' && parsed !== null && 'employees' in parsed
      ? (parsed as { employees: unknown }).employees
      : []

  if (!Array.isArray(records)) {
    throw new Error('JSON precisa ser uma lista ou conter a chave "employees".')
  }

  return { records: records as Record<string, unknown>[], headerRow: null }
}

async function loadRecords(filePath: string, sourceType: SeniorImportSourceType) {
  if (sourceType === 'xlsx') {
    return rowsFromSheet(filePath)
  }

  if (sourceType === 'csv') {
    return rowsFromCsv(filePath)
  }

  return rowsFromJson(filePath)
}

export default class SeniorImportService {
  async importFile(filePath: string): Promise<SeniorImportResult> {
    const sourceType = detectSourceType(filePath)
    const sourceFileName = path.basename(filePath)
    const importRecord = await SeniorImport.create({
      sourceType,
      sourceFileName,
      sourcePath: filePath,
      status: 'running',
      startedAt: DateTime.now(),
    })

    const errors: string[] = []
    let importedCount = 0
    let updatedCount = 0
    let skippedCount = 0
    let totalRows = 0

    try {
      const { records, headerRow } = await loadRecords(filePath, sourceType)
      totalRows = records.length
      importRecord.detectedHeaderRow = headerRow

      const existingEmployees = await Employee.query()
      const employeeMap = new Map<string, Employee>()
      for (const emp of existingEmployees) {
        if (emp.seniorSourceKey) {
          employeeMap.set(emp.seniorSourceKey, emp)
        }
      }

      const seniorKeyOccurrences = new Map<string, number>()
      const toInsert: any[] = []
      const toUpdate: { model: Employee; data: any }[] = []

      for (const [index, record] of records.entries()) {
        const sourceLine = headerRow ? headerRow + index + 1 : index + 1

        try {
          const employeeInput = makeSeniorEmployeeInput(record)
          if (!employeeInput) {
            skippedCount += 1
            continue
          }

          const baseSeniorSourceKey = makeSeniorSourceKey({
            fullName: employeeInput.fullName,
            birthDate: employeeInput.birthDate,
            costCenterCode: employeeInput.costCenterCode,
          })
          const occurrence = (seniorKeyOccurrences.get(baseSeniorSourceKey) ?? 0) + 1
          seniorKeyOccurrences.set(baseSeniorSourceKey, occurrence)
          const seniorSourceKey =
            occurrence === 1 ? baseSeniorSourceKey : `${baseSeniorSourceKey}|COLISAO-${occurrence}`

          const existingEmployee = employeeMap.get(seniorSourceKey)

          const employeeData = {
            fullName: employeeInput.fullName,
            normalizedName: normalizeSearchText(employeeInput.fullName),
            birthDate: employeeInput.birthDate ? DateTime.fromISO(employeeInput.birthDate) : null,
            costCenterCode: employeeInput.costCenterCode,
            costCenterDescription: employeeInput.costCenterDescription,
            roleName: employeeInput.roleName,
            companyName: employeeInput.companyName,
            seniorRaw: JSON.stringify(employeeInput.raw),
            seniorImportId: importRecord.id,
            status: 'active' as const,
          }

          if (existingEmployee) {
            const hasChanged =
              existingEmployee.fullName !== employeeData.fullName ||
              existingEmployee.birthDate?.toISODate() !== employeeData.birthDate?.toISODate() ||
              existingEmployee.costCenterCode !== employeeData.costCenterCode ||
              existingEmployee.costCenterDescription !== employeeData.costCenterDescription ||
              existingEmployee.roleName !== employeeData.roleName ||
              (employeeData.companyName && existingEmployee.companyName !== employeeData.companyName) ||
              existingEmployee.status !== 'active'

            if (hasChanged) {
              toUpdate.push({ model: existingEmployee, data: employeeData })
            } else {
              if (existingEmployee.seniorImportId !== importRecord.id) {
                toUpdate.push({ model: existingEmployee, data: { seniorImportId: importRecord.id } })
              } else {
                updatedCount += 1
              }
            }
          } else {
            toInsert.push({
              ...employeeData,
              seniorSourceKey,
            })
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro desconhecido'
          errors.push(`Linha ${sourceLine}: ${message}`)
        }
      }

      // Bulk insert new employees in batches
      if (toInsert.length > 0) {
        const batchSize = 100
        for (let i = 0; i < toInsert.length; i += batchSize) {
          const batch = toInsert.slice(i, i + batchSize)
          await Employee.createMany(batch)
          importedCount += batch.length
        }
      }

      // Update existing employees in concurrent batches
      if (toUpdate.length > 0) {
        const batchSize = 30
        for (let i = 0; i < toUpdate.length; i += batchSize) {
          const chunk = toUpdate.slice(i, i + batchSize)
          await Promise.all(
            chunk.map(async (item) => {
              try {
                item.model.merge(item.data)
                await item.model.save()
                updatedCount += 1
              } catch (error) {
                const message = error instanceof Error ? error.message : 'Erro desconhecido'
                errors.push(`Erro ao atualizar colaborador "${item.model.fullName}": ${message}`)
              }
            })
          )
        }
      }

      importRecord.merge({
        status: errors.length > 0 ? 'completed_with_errors' : 'completed',
        totalRows,
        importedCount,
        updatedCount,
        skippedCount,
        errorCount: errors.length,
        errorsJson: JSON.stringify(errors.slice(0, 200)),
        finishedAt: DateTime.now(),
      })
      await importRecord.save()
    } catch (error) {
      console.error('Erro crítico no importFile:', error)
      importRecord.merge({
        status: 'failed',
        totalRows,
        importedCount,
        updatedCount,
        skippedCount,
        errorCount: errors.length,
        errorsJson: JSON.stringify(errors),
        finishedAt: DateTime.now(),
      })
      await importRecord.save()
    }

    return {
      importRecord,
      importedCount,
      updatedCount,
      skippedCount,
      errorCount: errors.length,
    }
  }

  async importAuxiliaryFile(filePath: string): Promise<SeniorImportResult> {
    const rawSourceType = detectSourceType(filePath)
    const sourceType = `auxiliary_${rawSourceType}`
    const sourceFileName = path.basename(filePath)
    const importRecord = await SeniorImport.create({
      sourceType,
      sourceFileName,
      sourcePath: filePath,
      status: 'running',
      startedAt: DateTime.now(),
    })

    const errors: string[] = []
    let updatedCount = 0
    let skippedCount = 0
    let totalRows = 0

    try {
      const { records, headerRow } = await loadRecords(filePath, rawSourceType)
      totalRows = records.length
      importRecord.detectedHeaderRow = headerRow

      // Fetch all employees and vehicles for in-memory lookup
      const existingEmployees = await Employee.query()
      const employeeMap = new Map<string, Employee>()
      for (const emp of existingEmployees) {
        employeeMap.set(emp.normalizedName, emp)
      }

      const existingVehicles = await Vehicle.query()
      const vehicleMap = new Map<string, Vehicle>()
      for (const veh of existingVehicles) {
        vehicleMap.set(veh.normalizedPlate, veh)
      }

      const toUpdateEmployees: { model: Employee; data: any }[] = []
      const toInsertVehicles: any[] = []
      const toUpdateVehicles: { model: Vehicle; data: any }[] = []

      for (const [index, record] of records.entries()) {
        const sourceLine = headerRow ? headerRow + index + 1 : index + 1

        try {
          const fullName = asTrimmedString(
            getHeaderValue(record, ['Nome', 'colaborador', 'Colaborador', 'Nome Completo', 'fullName'])
          )
          if (!fullName) {
            skippedCount += 1
            continue
          }

          const normalizedName = normalizeSearchText(fullName)
          const employee = employeeMap.get(normalizedName)

          if (!employee) {
            errors.push(`Linha ${sourceLine}: Colaborador "${fullName}" não cadastrado no sistema.`)
            skippedCount += 1
            continue
          }

          let employeePhoneToUpdate: string | null = null
          const phoneInput = asTrimmedString(
            getHeaderValue(record, ['Telefone', 'Celular', 'Contato', 'Celular1', 'Celular2', 'phone'])
          )
          if (phoneInput) {
            const normalizedPhoneVal = normalizePhone(phoneInput)
            if (normalizedPhoneVal && employee.phone !== normalizedPhoneVal) {
              employeePhoneToUpdate = normalizedPhoneVal
            }
          }

          if (employeePhoneToUpdate || employee.seniorImportId !== importRecord.id) {
            const updateData: any = { seniorImportId: importRecord.id }
            if (employeePhoneToUpdate) {
              updateData.phone = employeePhoneToUpdate
            }
            toUpdateEmployees.push({ model: employee, data: updateData })
          }

          const licensePlate = asTrimmedString(
            getHeaderValue(record, ['Placa', 'Veículo Placa', 'Placa do Carro', 'licensePlate'])
          )
          if (licensePlate) {
            const normalizedPlateVal = normalizePlate(licensePlate)
            if (normalizedPlateVal) {
              const manufacturer = asTrimmedString(
                getHeaderValue(record, ['Marca', 'Fabricante', 'manufacturer'])
              )
              const model = asTrimmedString(getHeaderValue(record, ['Modelo', 'modelo', 'model']))
              const color = asTrimmedString(getHeaderValue(record, ['Cor', 'cor', 'color']))
              const yearVal = getHeaderValue(record, ['Ano', 'ano', 'year'])
              let year: number | null = null
              if (yearVal !== null && yearVal !== undefined) {
                const parsedYear = Number(yearVal)
                if (!isNaN(parsedYear) && parsedYear >= 1900 && parsedYear <= 2100) {
                  year = parsedYear
                }
              }

              let vehicleType = 'car'
              const lowerModel = model ? model.toLowerCase() : ''
              const lowerManufacturer = manufacturer ? manufacturer.toLowerCase() : ''
              const desc = `${lowerModel} ${lowerManufacturer}`
              if (
                desc.includes('moto') ||
                desc.includes('cg ') ||
                desc.includes('honda biz') ||
                desc.includes('titan') ||
                desc.includes('yamaha')
              ) {
                vehicleType = 'motorcycle'
              } else if (
                desc.includes('caminh') ||
                desc.includes('truck') ||
                desc.includes('scania') ||
                desc.includes('volvo') ||
                desc.includes('mercedes')
              ) {
                vehicleType = 'truck'
              } else if (
                desc.includes('van') ||
                desc.includes('ducato') ||
                desc.includes('sprinter') ||
                desc.includes('fiorino')
              ) {
                vehicleType = 'van'
              }

              const existingVehicle = vehicleMap.get(normalizedPlateVal)

              if (existingVehicle) {
                const hasChanged =
                  existingVehicle.employeeId !== employee.id ||
                  existingVehicle.manufacturer !== (manufacturer ?? existingVehicle.manufacturer) ||
                  existingVehicle.model !== (model ?? existingVehicle.model) ||
                  existingVehicle.color !== (color ?? existingVehicle.color) ||
                  existingVehicle.year !== (year ?? existingVehicle.year) ||
                  existingVehicle.status !== 'active'

                if (hasChanged) {
                  toUpdateVehicles.push({
                    model: existingVehicle,
                    data: {
                      employeeId: employee.id,
                      licensePlate: normalizedPlateVal,
                      manufacturer: manufacturer ?? existingVehicle.manufacturer,
                      model: model ?? existingVehicle.model,
                      color: color ?? existingVehicle.color,
                      year: year ?? existingVehicle.year,
                      vehicleType: vehicleType !== 'car' ? vehicleType : existingVehicle.vehicleType,
                      status: 'active' as const,
                    },
                  })
                }
              } else {
                toInsertVehicles.push({
                  employeeId: employee.id,
                  licensePlate: normalizedPlateVal,
                  normalizedPlate: normalizedPlateVal,
                  manufacturer,
                  model,
                  color,
                  year,
                  vehicleType,
                  status: 'active' as const,
                })
              }
            }
          }

          updatedCount += 1
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erro desconhecido'
          errors.push(`Linha ${sourceLine}: ${message}`)
        }
      }

      // Execute employee updates
      if (toUpdateEmployees.length > 0) {
        const batchSize = 30
        for (let i = 0; i < toUpdateEmployees.length; i += batchSize) {
          const chunk = toUpdateEmployees.slice(i, i + batchSize)
          await Promise.all(
            chunk.map(async (item) => {
              item.model.merge(item.data)
              await item.model.save()
            })
          )
        }
      }

      // Execute vehicle inserts
      if (toInsertVehicles.length > 0) {
        const batchSize = 100
        for (let i = 0; i < toInsertVehicles.length; i += batchSize) {
          const batch = toInsertVehicles.slice(i, i + batchSize)
          await Vehicle.createMany(batch)
        }
      }

      // Execute vehicle updates
      if (toUpdateVehicles.length > 0) {
        const batchSize = 30
        for (let i = 0; i < toUpdateVehicles.length; i += batchSize) {
          const chunk = toUpdateVehicles.slice(i, i + batchSize)
          await Promise.all(
            chunk.map(async (item) => {
              item.model.merge(item.data)
              await item.model.save()
            })
          )
        }
      }

      importRecord.merge({
        status: errors.length > 0 ? 'completed_with_errors' : 'completed',
        totalRows,
        importedCount: 0,
        updatedCount,
        skippedCount,
        errorCount: errors.length,
        errorsJson: JSON.stringify(errors.slice(0, 200)),
        finishedAt: DateTime.now(),
      })
      await importRecord.save()
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido'
      errors.push(message)
      importRecord.merge({
        status: 'failed',
        totalRows,
        importedCount: 0,
        updatedCount,
        skippedCount,
        errorCount: errors.length,
        errorsJson: JSON.stringify(errors),
        finishedAt: DateTime.now(),
      })
      await importRecord.save()
    }

    return {
      importRecord,
      importedCount: 0,
      updatedCount,
      skippedCount,
      errorCount: errors.length,
    }
  }
}
