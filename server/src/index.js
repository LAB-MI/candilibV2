import http from 'http'

import app from './app'
import { connect } from './mongo-connection'
import { techLogger } from './util'

const PORT = process.env.PORT || 8000

connect()
  .then(() => {
    http.createServer(app).listen(PORT, '0.0.0.0')
    techLogger.info(`Server running at http://0.0.0.0:${PORT}/`)
  })
  .catch(error => {
    techLogger.error(`Server could not connect to DB, exiting`)
    techLogger.error(error)
  })
