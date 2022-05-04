import { MongoMemoryServer } from 'mongodb-memory-server'
let mongoServer

module.exports = {
  getMongoServerConnectionString: async () => {
    if (!mongoServer) {
      mongoServer = await MongoMemoryServer.create({ binary: { version: '4.0.6' } })
    }
    return mongoServer.getUri()
  },
  stopMongoMemoryServer: () => {
    mongoServer.stop()
    mongoServer = undefined
  },
}
