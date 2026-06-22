import 'reflect-metadata'
import { createServer } from 'node:http'
import { Ignitor } from '@adonisjs/core'

const APP_ROOT = new URL('./build/', import.meta.url)
const IMPORTER = (filePath) => import(new URL(filePath, APP_ROOT).href)

const ignitor = new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('./build/start/env.js')
    })
    app.listen('SIGTERM', () => app.terminate())
    app.listenIf(app.managedByPm2, 'SIGINT', () => app.terminate())
  })
  .httpServer()

await ignitor.start()
