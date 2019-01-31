import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'
import fileupload from 'express-fileupload'

import { loggerStream } from './util/logger'
import routes from './routes'

import npmVersion from '../package.json'

const app = express()

export const apiPrefix = '/api/v2'

app.get(`${apiPrefix}/version`, function (req, res) {
  res.send(npmVersion.version)
})

app.use(morgan('combined', { stream: loggerStream }))
app.use(bodyParser.json({ limit: '20mb' }))
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
app.use(fileupload({ limits: { fileSize: 50 * 1024 * 1024 } }))

app.use(apiPrefix, routes)

export default app
