import { connect, disconnect } from '../src/mongo-connection'
import { simpleLogger as logger } from '../src/util'

connect()
  .then(async () => {
    const { default: createAdmin } = await import('./create-admin-account')
    const { default: createCandidats } = await import('./create-candidats')
    const { default: createCentres } = await import('./create-centres')
    const { default: createInspecteurs } = await import('./create-inspecteurs')
    return Promise.all([
      createAdmin(),
      createCandidats(),
      createCentres(),
      createInspecteurs(),
    ])
  })
  .catch(error => {
    logger.error(`Server could not connect to DB, exiting`)
    logger.error(error)
  })
  .then(() => disconnect())
