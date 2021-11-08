import { appLogger } from '../util'
import { onStart } from './automate'
import { LOGGER_INFO } from './constants'

/**
 * Schedule jobs in agenda
 *
 * @async
 * @function
 *
 * @param {import('agenda').Agenda} agenda
 */
export const scheduleJobs = async (agenda, jobs) => {
  appLogger.debug({ description: 'Scheduling jobs' })

  const jobPromises = jobs.map(({ repeatInterval, name }) => {
    return agenda.every(
      repeatInterval,
      name,
      null,
      { timezone: 'Europe/Paris' },
    )
  })

  const jobsScheduled = await Promise.all(jobPromises)

  appLogger.info({ ...LOGGER_INFO, description: 'Jobs scheduled!', jobNames: jobs.map(job => job.name) })

  return jobsScheduled
}

/**
 * Définit les jobs de l'agenda
 *
 * @async
 * @function
 *
 * @param {import('agenda').Agenda} agenda
 * @param {}
 */

const beforeStartJob = (job) => async (agendaJob) => {
  const isOnStart = await onStart()
  if (isOnStart) {
    return job.fn(agendaJob)
  }
}
export const defineJobs = async (agenda, jobs) => {
  for (const job of jobs) {
    agenda.define(job.name, beforeStartJob(job))
  }
}
