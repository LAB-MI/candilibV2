import http from 'http'
import app from './app'

import jobs from './job-list'
import startScheduler from './automate.js'

import { techLogger } from '../util'
import { LOGGER_INFO } from './constants'
import getConfig from './config.js'

const PORT = process.env.AUTOMATE_PORT || 9000

function startServer () {
  LOGGER_INFO.TENANT_NAME = getConfig().TENANT_NAME
  http.createServer(app).listen(PORT, '0.0.0.0')
  techLogger.info({ ...LOGGER_INFO, description: `Server running at http://0.0.0.0:${PORT}/` })
}

startScheduler(jobs)
startServer()
