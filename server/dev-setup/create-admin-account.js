import { createUser } from '../src/models/user'

import { simpleLogger as logger } from '../src/util/logger'

logger.info('Creating admin')

const adminEmail = 'admin@example.com'
const adminPassword = 'Admin*78'

export default async () => {
  return createUser(adminEmail, adminPassword)
    .then(() => {
      logger.info(`Compte admin ${adminEmail} créé !`)
    })
    .catch(error => logger.error(error))
}
