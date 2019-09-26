/**
 * Gestion de l'ordonnanceur des tâches de l'automate Manon
 * @module
 */
import getAgenda from './get-agenda.js'
import agenda from 'agenda' // eslint-disable-line no-unused-vars

import * as adminJobs from './admin/index.js'
import { appLogger } from './utils/index.js'

/**
 * @type JobNames
 */
const jobNames = {
  SEND_BORDEREAUX: 'SEND_BORDEREAUX',
}

/**
 * Stops gracefully the agenda
 * @function
 *
 * @param {import('agenda').Agenda} agenda
 */
const graceful = async (agenda) => {
  appLogger.info({ description: 'Stopping Manon' })
  await agenda.stop()
  process.exit(0)
}

/**
 * Schedule jobs in agenda
 * @function
 *
 * @param {import('agenda').Agenda} agenda
 */
const scheduleJobs = async (agenda) => {
  appLogger.debug({ description: 'Scheduling jobs' })

  const jobs = await Promise.all([
    agenda.every(
      '12 18 * * *',
      jobNames.SEND_BORDEREAUX,
      null,
      { timezone: 'Europe/Paris' },
    ),
  ])

  appLogger.info({ description: 'Jobs scheduled!' })

  return jobs
}

/**
 * Installe l'agenda : instantie un agenda, y définit les tâches, le démarre, ordonnance les tâches,
 * et écoute les signaux de fin (_SIGTERM_ et _SIGINT_) pour sortir proprement
 * @function
 */
export default async () => {
  const agenda = getAgenda()

  appLogger.debug({ description: 'Defining jobs' })

  agenda.define(jobNames.SEND_BORDEREAUX, adminJobs.sendBordereaux)

  appLogger.debug({ description: 'Starting Manon' })

  await agenda.start()

  appLogger.info({ description: 'Manon started' })

  await scheduleJobs(agenda)

  process.on('SIGTERM', () => graceful(agenda))
  process.on('SIGINT', () => graceful(agenda))
}

/**
 * @typedef {Object} JobNames
 * @property {string} SEND_BORDERAUX Nom du job pour envoyer les bordereaux aux inspecteurs
 */
