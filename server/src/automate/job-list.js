/**
 * Tous les jobs
 * @module job-list
 */

import getConfig from './config'
import * as adminJobs from './jobs'
import { GET_API_VERSION_JOB, HELLO_JOB } from './jobs'

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
    repeatInterval: '*/3 * * * *',
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
