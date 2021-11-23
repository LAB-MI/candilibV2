/**
 * Tous les jobs
 * @module job-list
 */

import getConfig from './config'
import * as adminJobs from './jobs'
import { GET_API_VERSION_JOB, HELLO_JOB, SORT_STATUS_CANDIDATS_JOB } from './jobs'
import { STOP_AGENDA_JOB } from './jobs/stop-agenda'

/**
 * @const {Object}
 */
const allJobs = {
  [HELLO_JOB]: {
    name: HELLO_JOB,
    fn: adminJobs.hello,
    repeatInterval: '*/3 * * * * *',
  },
  [GET_API_VERSION_JOB]: {
    name: 'GET_API_VERSION',
    fn: adminJobs.getApiVersion,
    repeatInterval: '50 22 * * *',
  },
  [SORT_STATUS_CANDIDATS_JOB]: {
    name: SORT_STATUS_CANDIDATS_JOB,
    fn: adminJobs.jobStatusCandidats,
    repeatInterval: '0 23 * * *',
  },
  [STOP_AGENDA_JOB]: {
    name: STOP_AGENDA_JOB,
    fn: adminJobs.jobStatusCandidats,
    repeatInterval: '0 22 * * *',
  },
}

/**
 * Identity function
 * @param {any} v
 *
 * @returns {any} Valeur passée en paramètre
 */
const identity = v => v

const jobList = getConfig().jobs.list
const jobs = jobList.map(jobProp => allJobs[jobProp]).filter(identity)

export default jobs
