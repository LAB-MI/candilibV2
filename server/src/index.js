import http from 'http'

import app from './app'
import { connect } from './mongo-connection'
import logger from './logger'

const PORT = process.env.PORT || 8000

connect()
  .then(() => {
    http.createServer(app).listen(PORT, '0.0.0.0')
    logger.info(`Server running at http://0.0.0.0:${PORT}/`)
  })
  .catch(error => {
    logger.error(`Server could not connect to DB, exiting`)
    logger.error(error)
  })
