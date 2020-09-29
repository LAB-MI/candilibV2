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
import { initDB, updateDB } from './initDB/initDB'
import pm2 from 'pm2'

const PORT = process.env.PORT || 8000

const asyncGetPIDPM2 = () => new Promise((resolve, reject) => {
  pm2.describe('API', (err, processDescription) => {
    if (err) reject(err)
    resolve(processDescription[0]?.pid)
  })
})

/**
 * Démarre le serveur (API),
 * mais uniquement si la connexion à la base de données MongoDB s'est effectuée
 * @async
 * @function startServer
 */
async function startServer () {
  try {
    const pid = await asyncGetPIDPM2()
    await connect()
    if (!pid || pid === process.pid) { await initDB() }
    http.createServer(app).listen(PORT, '0.0.0.0')
    techLogger.info(`Server running at http://0.0.0.0:${PORT}/`)

    if (!pid || pid === process.pid) { await updateDB() }
  } catch (error) {
    techLogger.error('Server could not connect to DB, exiting')
    techLogger.error(error)
  }
}

startServer()
