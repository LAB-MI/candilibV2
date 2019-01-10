import { connect, disconnect } from '../src/mongo-connection'
import logger from '../src/util/logger'

connect()
  .then(async () => {
    const { default: createAdmin } = await import('./create-admin-account')
    const { default: createSites } = await import('./create-sites')
    return Promise.all([
      createAdmin(),
      createSites(),
    ])
  })
  .catch(error => {
    logger.error(`Server could not connect to DB, exiting`)
    logger.error(error)
  })
  .then(() => disconnect())
