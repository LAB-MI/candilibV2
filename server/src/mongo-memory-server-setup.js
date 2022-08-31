import { MongoMemoryServer } from 'mongodb-memory-server'
let mongoServer
const mongoVersion = process.env.MONGOMS_VERSION || '4.0.6'
module.exports = {
  getMongoServerConnectionString: async () => {
    if (!mongoServer) {
      mongoServer = await MongoMemoryServer.create({ binary: { version: mongoVersion } })
    }
    return mongoServer.getUri()
  },
  stopMongoMemoryServer: () => {
    mongoServer.stop()
    mongoServer = undefined
  },
}
