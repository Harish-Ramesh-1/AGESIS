import { app } from './app.js'
import { env } from './config/env.js'
import { ensureDocumentsBucket } from './utils/storage.js'

async function bootstrap() {
  await ensureDocumentsBucket().catch((error) => {
    console.warn('[storage] bucket bootstrap skipped:', error.message)
  })

  app.listen(env.port, () => {
    console.log(`AGESIS backend listening on http://localhost:${env.port}`)
  })
}

bootstrap()
