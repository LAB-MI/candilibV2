import delay from 'delay'
import mongoose from 'mongoose'

import logger from './util/logger'

mongoose.Promise = Promise

const isTest = process.env.NODE_ENV === 'test'
const dbName = 'candilib'

let mongoServer

const mongoURL = process.env.MONGO_URL || `mongodb://localhost:27017/${dbName}`

let reconnectTries = 30
const reconnectInterval = process.env.NODE_ENV === 'production' ? 2000 : 1000

const mongooseOpts = {
  useNewUrlParser: true,
}

export const connect = async () => {
  let mongoUri
  try {
    if (isTest) {
      const {
        getMongoServerConnectionString,
      } = await import('./mongo-memory-server-setup')
      mongoUri = await getMongoServerConnectionString()
    } else {
      mongoUri = mongoURL
    }
    await mongoose.connect(
      mongoUri,
      mongooseOpts
    )
    logger.info('Connected to Mongo!')
    return mongoose
  } catch (err) {
    --reconnectTries
    if (reconnectTries > 0) {
      logger.warn(
        `Could not connect to Mongo at ${mongoUri}, ${reconnectTries} tries left`
      )
      return delay(reconnectInterval).then(connect)
    } else {
      const errorMessage =
        'Could not connect to Mongo, make sure it is started and listening on the appropriate port'
      throw new Error(errorMessage)
    }
  }
}

export const disconnect = async () => {
  try {
    await mongoose.disconnect()
  } catch (error) {
    logger.info('Disconnected from Mongo')
  }
}

export const stopMongoMemoryServer = () => mongoServer && mongoServer.stop()
