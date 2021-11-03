import express from 'express'
import npmVersion from '../../package.json'

import schedulerRouter from './scheduler'

export const apiPrefix = '/api/automate'

const app = express()

app.get(`${apiPrefix}/version`, function getVersion (req, res) {
  res.send(npmVersion.version)
})

app.use(apiPrefix, schedulerRouter)

export default app
