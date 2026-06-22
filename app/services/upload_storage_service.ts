import app from '@adonisjs/core/services/app'
import { mkdir } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import type { MultipartFile } from '@adonisjs/bodyparser/types'

const allowedScopes = new Set(['employees', 'vehicles'])

export async function storeUploadedImage(
  file: MultipartFile | null,
  scope: 'employees' | 'vehicles'
) {
  if (!file || !file.isValid) {
    return null
  }

  const extension = file.extname ? `.${file.extname}` : ''
  const fileName = `${randomUUID()}${extension}`
  const targetDirectory = app.makePath('storage', 'uploads', scope)

  await mkdir(targetDirectory, { recursive: true })
  await file.move(targetDirectory, { name: fileName, overwrite: false })

  return `/media/${scope}/${fileName}`
}

export function resolveStoredImagePath(scope: string, fileName: string) {
  if (
    !allowedScopes.has(scope) ||
    fileName.includes('..') ||
    fileName.includes('/') ||
    fileName.includes('\\')
  ) {
    return null
  }

  return app.makePath('storage', 'uploads', scope, fileName)
}
