/**
 * Module de configuration principale du serveur express
 * @module appSchedules
 */
import express from 'express'
import morgan from 'morgan'
import bodyParser from 'body-parser'

import { loggerStream, jsonFormat } from '../util/logger'
import routes from './routes'
import npmVersion from '../../package.json'

import { v4 as uuidv4 } from 'uuid'

/**
  * Préfixe de la version majeure de l'SDL
  */
export const apiPrefix = '/sdl/v2'

// const isDevelopment = [undefined, 'development'].includes(process.env.NODE_ENV)

const appSchedules = express()

appSchedules.get(`${apiPrefix}/version`, function getVersion (req, res) {
  res.send(npmVersion.version)
})

/**
  * Utiliser morgan pour journaliser toutes les requêtes en format JSON
  */
appSchedules.use(morgan(jsonFormat, { stream: loggerStream }))

/**
  * Analyser le corps des requêtes, des formulaires multipart et les fichiers téléversés
  */
appSchedules.use(bodyParser.json({ limit: '20mb' }))
appSchedules.use(bodyParser.urlencoded({ limit: '20mb', extended: false }))
//  appSchedules.use(fileupload({ limits: { fileSize: 50 * 1024 * 1024 } }))

/**
  * Traiter toutes les requêtes dont le chemin commençe par le préfix défini correspondant à la version majeure de l'API
  */
appSchedules.use(apiPrefix, (req, res, next) => {
  req.request_id = uuidv4()
  next()
}, routes)

export default appSchedules
