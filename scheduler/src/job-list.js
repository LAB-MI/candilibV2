/**
 * Tous les jobs
 * @module job-list
 */

import getConfig from './config.js'
import * as adminJobs from './admin/index.js'

/**
 * @const {Object}
 */
const allJobs = {
  hello: {
    name: 'HELLO',
    fn: adminJobs.hello,
    repeatInterval: '*/3 * * * *',
  },
  getApiVersion: {
    name: 'GET_API_VERSION',
    fn: adminJobs.getApiVersion,
    repeatInterval: '*/3 * * * *',
  },
  sendBordereaux: {
    name: 'SEND_BORDEREAUX',
    fn: adminJobs.sendBordereaux,
    repeatInterval: '12 18 * * *',
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
