/**
 * Gestion de l'ordonnanceur des tâches de l'automate (Manon)
 * @module
 */
import getAgenda from './get-agenda.js'
import getConfig from './config.js'
import agenda from 'agenda' // eslint-disable-line no-unused-vars
import * as adminJobs from './admin/index.js'

import { appLogger } from './utils/index.js'

/**
 * @type jobs
 */
const jobs = {
  hello: {
    name: 'HELLO',
    fn: adminJobs.hello,
  },
  getApiVersion: {
    name: 'GET_API_VERSION',
    fn: adminJobs.getApiVersion,
  },
}

/**
 * Stops gracefully the agenda
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
 * Schedule jobs in agenda
 * @function
 *
 * @param {import('agenda').Agenda} agenda
 */
const scheduleJobs = async (agenda) => {
  appLogger.debug({ description: 'Scheduling jobs' })

  const jobsScheduled = await Promise.all([
    agenda.every(
      '*/3 * * * *',
      jobs.hello.name,
      null,
      { timezone: 'Europe/Paris' },
    ),
    agenda.every(
      '*/3 * * * *',
      jobs.getApiVersion.name,
      null,
      { timezone: 'Europe/Paris' },
    ),
    /* agenda.every(
      '12 18 * * *',
      jobs.sendBordereaux.name,
      null,
      { timezone: 'Europe/Paris' },
    ),
    */
  ])

  appLogger.info({ description: 'Jobs scheduled!' })

  return jobsScheduled
}

/**
 * Définie les jobs de l'agenda
 * @function
 * @async
 *
 * @param {import('agenda').Agenda} agenda
 */
const defineJobs = async (agenda) => {
  // agenda.define(jobNames.SEND_BORDEREAUX, adminJobs.sendBordereaux)
  agenda.define(jobs.getApiVersion.name, jobs.getApiVersion.fn)
  agenda.define(jobs.hello.name, jobs.hello.fn)
}

/**
 * Installe l'agenda : instantie un agenda, y définit les tâches, le démarre, ordonnance les tâches,
 * et écoute les signaux de fin (_SIGTERM_ et _SIGINT_) pour sortir proprement
 * @function
 */
export default async () => {
  const agenda = getAgenda()

  if (getConfig().jobs.define) {
    appLogger.debug({ description: 'Defining jobs' })

    await defineJobs(agenda)
  }

  appLogger.debug({ description: 'Starting Scheduler' })

  await agenda.start()

  appLogger.info({ description: 'Scheduler started' })

  if (getConfig().jobs.schedule) {
    await scheduleJobs(agenda)
  }

  process.on('SIGTERM', () => graceful(agenda))
  process.on('SIGINT', () => graceful(agenda))
}

/**
 * @typedef {Object} JobNames
 * @property {string} SEND_BORDERAUX Nom du job pour envoyer les bordereaux aux inspecteurs
 */
