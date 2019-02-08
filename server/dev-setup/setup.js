import { connect, disconnect } from '../src/mongo-connection'
import logger from '../src/util/logger'

connect()
  .then(async () => {
    const { default: createAdmin } = await import('./create-admin-account')
    const { default: createCandidats } = await import('./create-candidats')
    const { default: createCentres } = await import('./create-centres')
    return Promise.all([
      createAdmin(),
      createCandidats(),
      createCentres(),
    ])
  })
  .catch(error => {
    logger.error(`Server could not connect to DB, exiting`)
    logger.error(error)
  })
  .then(() => disconnect())
  .then(() => logger.info('Disconnected from mongo-memory-server'))
