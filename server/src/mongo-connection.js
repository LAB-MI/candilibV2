import delay from 'delay'
import mongoose from 'mongoose'

import logger from './util/logger'

const isTest = process.env.NODE_ENV === 'test'
const dbName = isTest ? 'candilib_test' : 'candilib'

const mongoURL = process.env.MONGO_URL || `mongodb://localhost:27017/${dbName}`

let mongoConnectionAttempt = 30
const delayBeforeAttempt = process.env.NODE_ENV === 'production' ? 2000 : 1000

export const connect = async () => {
  try {
    await mongoose.connect(
      mongoURL,
      { useNewUrlParser: true }
    )
    logger.info('Connected to Mongo!')
    return mongoose
  } catch (err) {
    --mongoConnectionAttempt
    if (mongoConnectionAttempt > 0) {
      logger.warn(
        `Could not connect to Mongo, ${mongoConnectionAttempt} tries left`
      )
      return delay(delayBeforeAttempt).then(connect)
    } else {
      const errorMessage =
        'Could not connect to Mongo, make sure it is started and listening on the appropriate port'
      throw new Error(errorMessage)
    }
  }
}

export const disconnect = async () => {
  await mongoose.disconnect()
  logger.info('Disconnected from Mongo')
}
