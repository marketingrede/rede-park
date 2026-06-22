import type { Server as AdonisServer } from '@adonisjs/http-server'
import type { IncomingMessage, ServerResponse } from 'node:http'

await import('reflect-metadata')
const { Ignitor, prettyPrintError } = await import('@adonisjs/core')

type VercelHandler = (req: IncomingMessage, res: ServerResponse) => Promise<unknown> | undefined

const APP_ROOT = new URL('../', import.meta.url)

const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }

  return import(filePath)
}

let handlerPromise: Promise<VercelHandler> | undefined

async function bootApplication() {
  const ignitor = new Ignitor(APP_ROOT, { importer: IMPORTER }).tap((app) => {
    app.booting(async () => {
      await import('#start/env')
    })
  })

  const app = ignitor.createApp('web')
  let requestHandler: VercelHandler | undefined

  await app.init()
  await app.boot()
  await app.start(async () => {
    const server = (await app.container.make('server')) as AdonisServer

    await server.boot()
    requestHandler = server.handle.bind(server)
  })

  if (!requestHandler) {
    throw new Error('RedePark could not boot the AdonisJS HTTP handler')
  }

  return requestHandler
}

function getHandler() {
  handlerPromise ??= bootApplication().catch((error) => {
    handlerPromise = undefined
    prettyPrintError(error)
    throw error
  })

  return handlerPromise
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const requestHandler = await getHandler()

  return requestHandler(req, res)
}
