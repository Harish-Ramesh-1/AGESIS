import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { env } from './config/env.js'
import { apiRouter } from './routes/index.js'
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js'
import { globalLimiter, authLimiter } from './middleware/rateLimit.js'
import { razorpayWebhookRouter } from './modules/payments/webhook.routes.js'

export const app = express()

// Render/most PaaS providers sit behind a reverse proxy — without this,
// req.ip (used for rate limiting and audit logs) resolves to the proxy, not
// the real client.
app.set('trust proxy', 1)

app.use(helmet())
app.use(
  cors({
    // No Origin header (server-to-server calls, curl, mobile apps) is allowed
    // through; browser requests are checked against the configured allowlist.
    origin(origin, callback) {
      if (!origin || env.corsOrigins.includes(origin)) return callback(null, true)
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'))
app.use(globalLimiter)

// Razorpay webhook needs the raw body for signature verification, so it's
// mounted before the JSON body parser.
app.use('/api/payments/webhook', razorpayWebhookRouter)

app.use(express.json({ limit: '2mb' }))
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth/login', authLimiter)

app.get('/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

app.use('/api', apiRouter)

app.use(notFoundHandler)
app.use(errorHandler)
