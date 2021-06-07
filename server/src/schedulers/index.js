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

import appSchedules from './appSchedules'
import { connect, disconnect } from '../mongo-connection'
import { techLogger } from '../util'
// import { initDB, initStatus, updateDB } from './initDB/initDB'
import pm2 from 'pm2'
import { DEFAULT_PORT_SCHEDULERS, DEFAULT_SCHEDULERS_URL } from '../config'
// import { accumulatorLog } from './routes/middlewares'

const PORT_SCHEDULERS = process.env.PORT_SCHEDULERS || DEFAULT_PORT_SCHEDULERS

const BASE_URL_SCHEDULERS = process.env.URL_SCHEDULERS || DEFAULT_SCHEDULERS_URL

const asyncGetPIDPM2 = () => new Promise((resolve, reject) => {
  pm2.describe('SDL', (err, processDescription) => {
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
    http.createServer(appSchedules).listen(PORT_SCHEDULERS)
    techLogger.info(`Server SDL running at ${BASE_URL_SCHEDULERS}:${PORT_SCHEDULERS}/ with PID => [${pid}]`)
  } catch (error) {
    techLogger.error('Server SDL could not connect to DB, exiting')
    techLogger.error(error)
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
    techLogger.error(error)
  }

  // clearInterval(accumulatorLog.intervalId)

  techLogger.info('Closing connections...')
  await disconnect()
  techLogger.info('Exiting...')

  process.exit(error instanceof Error ? 1 : 0)
}

startServer()
handleExit()
