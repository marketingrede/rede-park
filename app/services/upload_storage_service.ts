import app from '@adonisjs/core/services/app'
import { mkdir } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import type { MultipartFile } from '@adonisjs/bodyparser/types'
import os from 'node:os'
import path from 'node:path'

const allowedScopes = new Set(['employees', 'vehicles'])

export function getWritableStoragePath(...subPaths: string[]) {
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), 'redepark', ...subPaths)
  }
  return app.makePath('storage', ...subPaths)
}

export async function storeUploadedImage(
  file: MultipartFile | null,
  scope: 'employees' | 'vehicles'
) {
  if (!file || !file.isValid) {
    return null
  }

  const extension = file.extname ? `.${file.extname}` : ''
  const fileName = `${randomUUID()}${extension}`
  const targetDirectory = getWritableStoragePath('uploads', scope)

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

  return getWritableStoragePath('uploads', scope, fileName)
}
