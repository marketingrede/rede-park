import type { HttpContext } from '@adonisjs/core/http'

const allowedScopes = new Set(['employees', 'vehicles'])

export default class MediaController {
  async show({ params, response }: HttpContext) {
    const scope = String(params.scope ?? '')
    const fileName = String(params.fileName ?? '')

    if (
      !allowedScopes.has(scope) ||
      fileName.includes('..') ||
      fileName.includes('/') ||
      fileName.includes('\\')
    ) {
      return response.notFound()
    }

    const ext = fileName.split('.').pop()?.toLowerCase() ?? ''
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      return response.notFound()
    }

    const id = parseInt(fileName.split('.')[0], 10)
    if (isNaN(id)) {
      return response.notFound()
    }

    let photoData: string | null = null
    let photoMime: string | null = null

    if (scope === 'employees') {
      const { default: Employee } = await import('#models/employee')
      const employee = await Employee.find(id)
      if (employee) {
        photoData = employee.photoData
        photoMime = employee.photoMime
      }
    } else if (scope === 'vehicles') {
      const { default: Vehicle } = await import('#models/vehicle')
      const vehicle = await Vehicle.find(id)
      if (vehicle) {
        photoData = vehicle.photoData
        photoMime = vehicle.photoMime
      }
    }

    if (!photoData || !photoMime) {
      return response.notFound()
    }

    const buffer = Buffer.from(photoData, 'base64')

    response.header('Content-Type', photoMime)
    response.header('Cache-Control', 'public, max-age=86400')

    return response.send(buffer)
  }
}
