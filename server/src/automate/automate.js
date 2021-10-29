/**
 * Gestion de l'ordonnanceur des tâches de l'automate (Manon)
 * @module automate
 */
import getAgenda from './get-agenda.js'
import getConfig from './config'
import { appLogger } from '../util'
import { defineJobs, scheduleJobs } from './libs'
import { connect, disconnect } from '../mongo-connection.js'

/**
 * Stops gracefully the agenda
 *
 * @async
 * @function
 *
 * @param {import('agenda').Agenda} agenda
 */
const graceful = async (agenda, mongoose) => {
  appLogger.info({ description: 'Stopping Scheduler' })
  agenda && await agenda.stop()
  mongoose && await disconnect()
  process.exit(0)
}

/**
 * Installe l'agenda : instantie un agenda, y définit les tâches, le démarre, ordonnance les tâches,
 * et écoute les signaux de fin (_SIGTERM_ et _SIGINT_) pour sortir proprement
 *
 * @async
 * @function
 */
let agenda
let mongoose
export default async (jobs) => {
  const loggerInfo = {
    section: 'Automate',
    action: 'START',
  }
  try {
    process.on('SIGTERM', () => graceful())
    process.on('SIGINT', () => graceful())
    mongoose = await connect()
    agenda = await getAgenda(mongoose)
    if (getConfig().jobs.define) {
      appLogger.debug({ ...loggerInfo, description: 'Defining jobs', jobs: getConfig().jobs.define })
      await defineJobs(agenda, jobs)
    }

    appLogger.debug({ ...loggerInfo, description: 'Starting Scheduler' })
    await agenda.start()

    appLogger.info({ ...loggerInfo, description: 'Scheduler started' })

    if (getConfig().jobs.schedule) {
      await scheduleJobs(agenda, jobs)
    }
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      action: 'START',
      description: error.message,
      error,
    })
    process.exit(0)
  }
}
