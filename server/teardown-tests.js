const { stopMongoMemoryServer } = require('./src/mongo-memory-server-setup')

module.exports = async () => {
  console.log('All tests are done, stopping MongoMemoryServer')
  await stopMongoMemoryServer()
}
