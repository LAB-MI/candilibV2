import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'

import { loggerStream } from './logger'
import routes from './routes'

const app = express()

export const apiPrefix = '/api/v2'

app.use(morgan('combined', { stream: loggerStream }))
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))

app.use(apiPrefix, routes)

export default app
