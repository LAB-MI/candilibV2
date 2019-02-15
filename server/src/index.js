import http from 'http'

import app from './app'
import { connect } from './mongo-connection'
import connectToMsgBroker, { addLog } from './msg-broker-setup'
import logger from './util/logger'

const PORT = process.env.PORT || 8000

connect()
  .then(() => connectToMsgBroker())
  .then(() => {
    http.createServer(app).listen(PORT, '0.0.0.0')
    logger.info(`Server running at http://0.0.0.0:${PORT}/`)
    addLog('Connected to mongo!')
  })
  .catch(error => {
    logger.error(`Server could not connect to DB, exiting`)
    logger.error(error)
    addLog('Could not connect to mongo')
  })
