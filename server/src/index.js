import http from 'http'

import app from './app'
import mongoConnect from './mongo-connection'

const PORT = process.env.PORT || 8000

mongoConnect()
  .then(() => {
    http.createServer(app).listen(PORT, 'localhost')
    console.log(`Server running at http://localhost:${PORT}/`)
  })
  .catch(error => {
    console.log(`Server could not connect to DB, exiting`)
  })
