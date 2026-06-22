import { resolveStoredImagePath } from '#services/upload_storage_service'
import type { HttpContext } from '@adonisjs/core/http'

export default class MediaController {
  async show({ params, response }: HttpContext) {
    const filePath = resolveStoredImagePath(params.scope, params.fileName)
    if (!filePath) {
      return response.notFound()
    }

    return response.download(filePath)
  }
}
