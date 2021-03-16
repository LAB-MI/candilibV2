const MongoMemoryServer = require('mongodb-memory-server').default
const mongoServer = new MongoMemoryServer()

module.exports = {
  getMongoServerConnectionString: () => mongoServer.getUri(),
  stopMongoMemoryServer: () => mongoServer.stop(),
}
