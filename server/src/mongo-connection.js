import delay from 'delay'
import mongoose from 'mongoose'

import { dbOptions } from './config'
import { techLogger } from './util'

mongoose.Promise = Promise

const isTest = process.env.NODE_ENV === 'test'
const dbName = dbOptions.db
const dbAdmin = dbOptions.user
const dbPassword = dbOptions.pass

const mongoURL =
  process.env.MONGO_URL ||
  `mongodb://${dbAdmin}:${dbPassword}@localhost:27017/${dbName}`

let reconnectTries = 30
const reconnectInterval = process.env.NODE_ENV === 'production' ? 2000 : 1000

const mongooseOpts = {
  useNewUrlParser: true,
  useFindAndModify: false,
  useCreateIndex: true,
  useUnifiedTopology: true,
  poolSize: 10,
  family: 4,
}

const mongoUrl = async () => {
  if (isTest) {
    const { getMongoServerConnectionString } = await import(
      './mongo-memory-server-setup'
    )
    mongoUri = await getMongoServerConnectionString()
    // mongoUri = 'mongodb://adminCandilib:changeme78@localhost:27017/candilib'
  } else {
    mongoUri = mongoURL
  }
  return mongoUri
}
let mongoUri
mongoUrl().then(uri => mongoUri = uri)
export const connect = async () => {
  try {
    if (!mongoUri) {
      mongoUri = await mongoUrl()
    }
    await mongoose.connect(mongoUri, mongooseOpts)
    techLogger.info('Connected to Mongo!')
    return mongoose
  } catch (err) {
    --reconnectTries
    if (reconnectTries > 0) {
      techLogger.warn(
        `Could not connect to Mongo at ${mongoUri}, ${reconnectTries} tries left`,
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
    if (isTest) {
      const { stopMongoMemoryServer } = await import(
        './mongo-memory-server-setup'
      )
      await stopMongoMemoryServer()
    }
  } catch (error) {
    techLogger.info('Disconnected from Mongo')
  }
}

export const anotherConnexion = async () => {
  // mongoUri = 'mongodb://adminCandilib:changeme78@localhost:27017/candilib'

  if (!mongoUri) {
    mongoUri = await mongoUrl()
  }

  return mongoose.createConnection(
    mongoUri,
    { ...mongooseOpts, useCreateIndex: false, autoIndex: false })
}
