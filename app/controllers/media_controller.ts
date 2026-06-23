import { resolveStoredImagePath } from '#services/upload_storage_service'
import type { HttpContext } from '@adonisjs/core/http'

const allowedExtensions = new Set(['jpg', 'jpeg', 'png', 'webp'])

const mimeTypes: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

export default class MediaController {
  async show({ params, response }: HttpContext) {
    const fileName = String(params.fileName ?? '')
    const ext = fileName.split('.').pop()?.toLowerCase() ?? ''

    if (!allowedExtensions.has(ext)) {
      return response.notFound()
    }

    const filePath = resolveStoredImagePath(params.scope, fileName)
    if (!filePath) {
      return response.notFound()
    }

    response.header('Content-Type', mimeTypes[ext] ?? 'application/octet-stream')
    response.header('Cache-Control', 'public, max-age=86400')

    return response.download(filePath)
  }
}
