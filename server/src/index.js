import http from 'http'

import app from './app'
import mongoConnect from './mongo-connection'
import logger from './logger'

const PORT = process.env.PORT || 8000

mongoConnect()
  .then(() => {
    http.createServer(app).listen(PORT, 'localhost')
    logger.info(`Server running at http://localhost:${PORT}/`)
  })
  .catch(error => {
    logger.error(`Server could not connect to DB, exiting`)
  })
