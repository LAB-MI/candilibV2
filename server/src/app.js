import express from 'express'
import morgan from 'morgan'

import { loggerStream } from './logger'

const app = express()

app.use(morgan('combined', { stream: loggerStream }))

app.get('/', (req, res) => res.send('Hello World!'))

module.exports = app
