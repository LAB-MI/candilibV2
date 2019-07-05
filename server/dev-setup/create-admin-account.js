import { createUser } from '../src/models/user'

import { simpleLogger as logger } from '../src/util'

import admins from './admins'

logger.info('Creating admins')

export default async () => {
  const adminsCreated = admins.map(({ password, email, departements, status }) =>
    createUser(email, password, departements, status)
      .then(() => {
        logger.info(`Compte admin ${email} créé !`)
      })
      .catch(error => logger.error(error))
  )
  return Promise.all(adminsCreated)
}
