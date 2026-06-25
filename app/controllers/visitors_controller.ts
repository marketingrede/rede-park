import Visitor from '#models/visitor'
import { visitorValidator } from '#validators/redepark'
import {
  normalizeDigits,
  normalizePlate,
  normalizeSearchText,
} from '#services/normalization_service'
import { auditLog } from '#services/audit_service'
import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'

export default class VisitorsController {
  async index({ request, inertia }: HttpContext) {
    const queryText = normalizeSearchText(request.input('q', ''))
    const normalizedPlate = normalizePlate(queryText)
    const normalizedDigits = normalizeDigits(queryText)
    const status = String(request.input('status', 'inside'))

    const visitors = await Visitor.query()
      .if(status === 'inside', (query) => query.whereNull('exited_at'))
      .if(queryText.length > 0, (query) => {
        query.where((builder) => {
          builder
            .where('normalized_name', 'like', `%${queryText}%`)
            .orWhere('normalized_cpf', 'like', `%${normalizedDigits}%`)
            .orWhere('normalized_plate', 'like', `%${normalizedPlate}%`)
        })
      })
      .orderBy('entered_at', 'desc')
      .limit(120)

    const allPast = await Visitor.query()
      .select([
        'id',
        'full_name',
        'cpf',
        'license_plate',
        'vehicle_type',
        'manufacturer',
        'model',
        'year',
        'company_name',
      ])
      .whereNotNull('exited_at')
      .orderBy('entered_at', 'desc')
      .limit(200)

    const uniquePastMap = new Map<string, any>()
    for (const v of allPast) {
      const cpfClean = v.cpf.trim()
      if (!uniquePastMap.has(cpfClean)) {
        uniquePastMap.set(cpfClean, v.serialize())
      }
    }
    const pastVisitors = Array.from(uniquePastMap.values())

    return inertia.render(
      'visitors/index' as never,
      {
        filters: { q: request.input('q', ''), status },
        visitors,
        pastVisitors,
      } as never
    )
  }

  async store({ request, auth, response, session }: HttpContext) {
    const payload = await request.validateUsing(visitorValidator)

    const visitor = await Visitor.create({
      ...payload,
      normalizedName: normalizeSearchText(payload.fullName),
      normalizedCpf: normalizeDigits(payload.cpf),
      normalizedPlate: normalizePlate(payload.licensePlate),
      licensePlate: normalizePlate(payload.licensePlate),
      enteredAt: DateTime.now(),
    })

    await auditLog({
      user: auth.user,
      action: 'create',
      entityType: 'visitor',
      entityId: visitor.id,
      newValues: { fullName: visitor.fullName, cpf: visitor.cpf },
      ip: request.ip(),
    })

    session.flash('success', 'Visitante registrado.')
    return response.redirect('/visitantes')
  }

  async exit({ params, request, auth, response, session }: HttpContext) {
    const visitor = await Visitor.findOrFail(params.id)
    visitor.exitedAt = DateTime.now()
    await visitor.save()

    await auditLog({
      user: auth.user,
      action: 'exit',
      entityType: 'visitor',
      entityId: visitor.id,
      ip: request.ip(),
    })

    session.flash('success', 'Saída registrada.')
    return response.redirect('/visitantes')
  }
}
