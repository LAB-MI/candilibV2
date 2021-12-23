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
import { connect, disconnect } from './mongo-connection'
import { techLogger } from './util'
import { initDB, initStatus, updateDB } from './initDB/initDB'
import { addListener, asyncGetPIDPM2, initBus, sendMessageIPC } from './util/pm2-util'
import { accumulatorLog, placesAndGeoDepartementsAndCentresCache } from './routes/middlewares'

const PORT = process.env.PORT || 8000

async function initCache (data) {
  try {
    await placesAndGeoDepartementsAndCentresCache.initCache()
    techLogger.info({
      section: 'start-server-set-geo-departemens-and-centres',
      pid: process.pid,
      description: 'init-cache lancé',
      data,
    })
  } catch (error) {
    techLogger.error({
      section: 'start-server-set-geo-departemens-and-centres',
      pid: process.pid,
      description: error.message,
      error,
      data,
    })
  }
}

/**
 * Démarre le serveur (API),
 * mais uniquement si la connexion à la base de données MongoDB s'est effectuée
 * @async
 * @function startServer
 */
async function startServer () {
  try {
    const pid = await asyncGetPIDPM2()
    addListener('INIT_CACHE', initCache)
    initBus()
    await connect()
    if (!pid || pid === process.pid) {
      await initDB()
      try {
        await initStatus()
        sendMessageIPC('INIT_CACHE')
      } catch (error) {
        techLogger.error({
          section: 'start-server-init-status',
          description: error.message,
          error,
        })
      }
    }

    await initCache()

    http.createServer(app).listen(PORT, '0.0.0.0')
    techLogger.info(`Server running at http://0.0.0.0:${PORT}/`)

    if (!pid || pid === process.pid) { await updateDB() }
  } catch (error) {
    techLogger.error('Server could not connect to DB, exiting')
    techLogger.error({
      section: 'start-server-connect-exiting-db',
      description: error.message,
      error,
    })
    process.exit(error instanceof Error ? 1 : 0)
  }
}

/**
 * Handle unexpected exits to exit gracefuly (close connections to DB)
 *
 * @function
 */
export function handleExit () {
  process.on('exit', exitGracefuly)

  // This will handle kill commands, such as CTRL+C:
  process.on('SIGINT', exitGracefuly)
  process.on('SIGTERM', exitGracefuly)

  // This will prevent dirty exit on code-fault crashes:
  process.on('uncaughtException', exitGracefuly)
}

/**
 * Ferme proprement les connexions à MongoDB en cas d'arrêt de l'application
 *
 * @async
 * @function
 *
 * @param {Error=} error - Error remontée dans le cas d'un arrêt suite à une erreur non gérée
 *
 * @returns {void}
 */
export async function exitGracefuly (error) {
  if (error instanceof Error) {
    techLogger.error({
      section: 'exit-gracefuly',
      description: error.message,
      error,
    })
  }

  clearInterval(accumulatorLog.intervalId)

  techLogger.info('Closing connections...')
  await disconnect()
  techLogger.info('Exiting...')

  process.exit(error instanceof Error ? 1 : 0)
}

startServer()
handleExit()
