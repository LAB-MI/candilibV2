import http from 'http'

import app from './app'

const PORT = process.env.PORT || 8000

http.createServer(app).listen(PORT, 'localhost')

console.log(`Server running at http://localhost:${PORT}/`)
