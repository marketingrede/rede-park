import { readFile, unlink, mkdir } from 'node:fs/promises'
import { randomUUID } from 'node:crypto'
import type { MultipartFile } from '@adonisjs/bodyparser/types'
import os from 'node:os'
import path from 'node:path'
import app from '@adonisjs/core/services/app'

export function getWritableStoragePath(...subPaths: string[]) {
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), 'redepark', ...subPaths)
  }
  return app.makePath('storage', ...subPaths)
}

export async function storeUploadedImage(
  _file: MultipartFile | null,
  _scope: 'employees' | 'vehicles'
): Promise<{ photoData: string; photoMime: string } | null> {
  if (!_file || !_file.isValid) {
    return null
  }

  const mime =
    _file.type && _file.subtype ? `${_file.type}/${_file.subtype}` : 'application/octet-stream'

  const tempDir = path.join(os.tmpdir(), 'redepark-upload')
  await mkdir(tempDir, { recursive: true })

  const tempFile = path.join(tempDir, `${randomUUID()}.${_file.extname || 'bin'}`)
  await _file.move(tempDir, { name: path.basename(tempFile), overwrite: false })

  try {
    const buffer = await readFile(tempFile)
    const base64 = buffer.toString('base64')
    return { photoData: base64, photoMime: mime }
  } finally {
    try {
      await unlink(tempFile)
    } catch {
      // Ignore cleanup errors
    }
  }
}

export function resolveStoredImagePath(_scope: string, _fileName: string) {
  return null
}
