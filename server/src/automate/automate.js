/**
 * Gestion de l'ordonnanceur des tâches de l'automate (Manon)
 * @module automate
 */
import getAgenda from './get-agenda.js'
import getConfig from './config'
import { appLogger } from '../util'
import { defineJobs, scheduleJobs } from './libs'
import { disconnect } from '../mongo-connection.js'
import { LOGGER_INFO } from './constants.js'
import { getConnectDB } from './get-connect-db.js'
import { findStatusByType, upsertStatusByType } from '../models/status/status.queries.js'

let agenda
let mongoose
let isStarted
// let agenda
// let mongoose
/**
 * Stops gracefully the agenda
 *
 * @async
 * @function
 *
 * @param {import('agenda').Agenda} agenda
 */
const graceful = async () => {
  appLogger.info({ description: 'Stopping Scheduler' })
  agenda && await agenda.stop()
  mongoose && await disconnect()
  process.exit(0)
}

export async function startAgendaAndJobs (jobs, loggerInfo) {
  appLogger.info({ ...loggerInfo, description: 'Starting Scheduler' })
  await agenda.start()
  isStarted = true
  // TODO; factoriser dans une fonciton
  if (getConfig().jobs.define) {
    appLogger.debug({ ...loggerInfo, description: 'Defining jobs', jobs: getConfig().jobs.define })
    await defineJobs(agenda, jobs)
  }
  appLogger.info({ ...loggerInfo, description: 'Scheduler started' })

  if (getConfig().jobs.schedule) {
    await scheduleJobs(agenda, jobs)
  }
  await upsertStatusByType({ type: 'TENANTNAME', message: getConfig().TENANTNAME })
}

export async function stopAgenda () {
  await agenda.stop()
  isStarted = false
}

export function getIntanceAgenda () {
  return agenda
}

export function isAgendaStarted () {
  return isStarted
}

export async function isReadyToOnAir () {
  const statusFromDB = await findStatusByType({ type: 'TENANTNAME' })
  const tenantName = statusFromDB && statusFromDB.message
  return tenantName === getConfig().TENANTNAME
}

/**
 * Installe l'agenda : instantie un agenda, y définit les tâches, le démarre, ordonnance les tâches,
 * et écoute les signaux de fin (_SIGTERM_ et _SIGINT_) pour sortir proprement
 *
 * @async
 * @function
 */
export default async (jobs) => {
  const loggerInfo = {
    ...LOGGER_INFO,
    action: 'NEW INSTANCE',
  }
  try {
    process.on('SIGTERM', () => graceful())
    process.on('SIGINT', () => graceful())
    mongoose = await getConnectDB()
    agenda = await getAgenda(mongoose)

    if (await isReadyToOnAir() && !isStarted) {
      await startAgendaAndJobs(jobs, loggerInfo)
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
