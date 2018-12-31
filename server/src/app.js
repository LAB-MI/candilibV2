import express from 'express'
import morgan from 'morgan'

import { loggerStream } from './logger'
import routes from './routes'

const app = express()

export const apiPrefix = '/api/v2'

app.use(morgan('combined', { stream: loggerStream }))

app.use(apiPrefix, routes)

export default app
