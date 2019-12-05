/**
 * Module de démarrage du serveur
 * @module index
 */

/**
 * @constant {import('luxon').DateTime}
 *
 * DateTime object from luxon {@link https://moment.github.io/luxon/docs/}
 */

import http from 'http'

import app from './app'
import { connect } from './mongo-connection'
import { techLogger } from './util'

const PORT = process.env.PORT || 8000

/**
 * Démarre le serveur (API),
 * mais uniquement si la connexion à la base de données MongoDB s'est effectuée
 * @async
 * @function startServer
 */
async function startServer () {
  try {
    await connect()
    http.createServer(app).listen(PORT, '0.0.0.0')
    techLogger.info(`Server running at http://0.0.0.0:${PORT}/`)
  } catch (error) {
    techLogger.error('Server could not connect to DB, exiting')
    techLogger.error(error)
  }
}

startServer()
