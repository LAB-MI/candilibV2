import express from 'express'
// import morgan from 'morgan'
import bodyParser from 'body-parser'
import npmVersion from '../../package.json'
// import { jsonFormat, loggerStream } from '../util'

import schedulerRouter from './scheduler'

export const apiPrefix = '/api/automate'

const app = express()

app.get(`${apiPrefix}/version`, function getVersion (req, res) {
  res.send(npmVersion.version)
})

/**
 * Utiliser morgan pour journaliser toutes les requêtes en format JSON
 */
// app.use(morgan(jsonFormat, { stream: loggerStream }))

/**
  * Analyser le corps des requêtes, des formulaires multipart et les fichiers téléversés
  */
app.use(bodyParser.json({ limit: '20mb' }))

app.use(apiPrefix, schedulerRouter)

app.use(function (req, res, next) {
  res.status(404).send({ success: false, message: `${req.path} not found` })
})

export default app
