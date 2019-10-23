/**
 * Gestion de l'ordonnanceur des tâches de l'automate (Manon)
 * @module automate
 */
import getAgenda from './get-agenda.js'
import getConfig from './config.js'
import { appLogger } from './utils/index.js'
import { defineJobs, scheduleJobs } from './libs'

/**
 * Stops gracefully the agenda
 *
 * @async
 * @function
 *
 * @param {import('agenda').Agenda} agenda
 */
const graceful = async (agenda) => {
  appLogger.info({ description: 'Stopping Scheduler' })
  await agenda.stop()
  process.exit(0)
}

/**
 * Installe l'agenda : instantie un agenda, y définit les tâches, le démarre, ordonnance les tâches,
 * et écoute les signaux de fin (_SIGTERM_ et _SIGINT_) pour sortir proprement
 *
 * @async
 * @function
 */
export default async (jobs) => {
  const agenda = getAgenda()

  if (getConfig().jobs.define) {
    appLogger.debug({ description: 'Defining jobs' })

    await defineJobs(agenda, jobs)
  }

  appLogger.debug({ description: 'Starting Scheduler' })

  await agenda.start()

  appLogger.info({ description: 'Scheduler started' })

  if (getConfig().jobs.schedule) {
    await scheduleJobs(agenda, jobs)
  }

  process.on('SIGTERM', () => graceful(agenda))
  process.on('SIGINT', () => graceful(agenda))
}
