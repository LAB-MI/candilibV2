import { MongoMemoryServer } from 'mongodb-memory-server'
let mongoServer
// const mongoServer = new MongoMemoryServer({ binary: { version: '4.0.6' } })
module.exports = {
  getMongoServerConnectionString: async () => {
    if (!mongoServer) {
      mongoServer = await MongoMemoryServer.create({ binary: { version: '4.0.6' } })
    }
    // await mongoServer.start()
    return mongoServer.getUri()
  },
  stopMongoMemoryServer: () => {
    mongoServer.stop()
    mongoServer = undefined
  },
}
