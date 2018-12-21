import delay from 'delay'
import mongoose from 'mongoose'

import logger from './logger'

const mongoURL = process.env.MONGO_URL || 'mongodb://localhost:27017/candilib'

let mongoConnectionAttempt = 10
const delayBeforeAttempt = process.env.NODE_ENV === 'production' ? 2000 : 1000

const connectToMongo = async () => {
  try {
    await mongoose.connect(
      mongoURL,
      { useNewUrlParser: true }
    )
    logger.info('Connected to Mongo!')
    return true
  } catch (err) {
    --mongoConnectionAttempt
    if (mongoConnectionAttempt > 0) {
      logger.warn(
        `Could not connect to Mongo, ${mongoConnectionAttempt} tries left`
      )
      return delay(delayBeforeAttempt).then(connectToMongo)
    } else {
      const errorMessage =
        'Could not connect to Mongo, make sure it is started and listening on the appropriate port'
      throw new Error(errorMessage)
    }
  }
}

export default connectToMongo
