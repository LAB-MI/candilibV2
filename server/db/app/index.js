const http = require('http')
const app = require('./app.js')

const PORT = process.env.PORT || 8090

function startServer () {
  try {
    http.createServer(app).listen(PORT, '0.0.0.0')
    console.info(`Server running at http://0.0.0.0:${PORT}/`)
  } catch (error) {
    console.error(error)
  }
}

startServer()
