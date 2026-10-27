import 'dotenv/config'
import cors from 'cors'
import express from 'express'
import { db } from './src/database/prisma.js'
import { errorHandler, HttpError } from './src/middlewares/error.middleware.js'
import rootRouter from './src/routes/index.js'

const port = Number(process.env.PORT ?? 3000)

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error(`Invalid PORT value: ${process.env.PORT}`)
}

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (_request, response) => {
  response.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use('/api', rootRouter)

app.use((_request, _response, next) => {
  next(new HttpError(404, 'Route not found'))
})

app.use(errorHandler)

const server = app.listen(port, '0.0.0.0', () => {
  console.info(`AuctionHub backend listening on port ${port}`)
})

function shutdown(signal: NodeJS.Signals) {
  console.info(`Received ${signal}; shutting down backend`)
  server.close((error) => {
    if (error) {
      console.error('Failed to close HTTP server:', error)
      process.exitCode = 1
    }

    void db.close().catch((databaseError: unknown) => {
      console.error('Failed to close database connection:', databaseError)
      process.exitCode = 1
    })
  })
}

process.once('SIGINT', shutdown)
process.once('SIGTERM', shutdown)