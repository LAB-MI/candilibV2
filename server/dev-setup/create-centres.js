import { createCentre } from '../src/models/centre'

import { simpleLogger as logger } from '../src/util'
import centres from './centres'

logger.info('Creating centres')

const centresInCreation = []

export default async () => {
  for (const { nom, label, adresse, departement } of centres) {
    const createdCentres = createCentre(nom, label, adresse, departement)
      .then(() => {
        logger.info(`Centre ${nom} créé !`)
      })
      .catch(error => logger.error(error))
    centresInCreation.push(createdCentres)
  }

  return Promise.all(centresInCreation)
}
