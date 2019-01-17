import { createSite } from '../src/models/centre'

import logger from '../src/util/logger'
import centres from './centres'

logger.info('Creating centres')

const centresInCreation = []

export default async () => {
  for (const { nom, label, adresse, departement } of sites) {
    const createdSites = createSite(nom, label, adresse, departement)
      .then(() => {
        logger.info(`Site ${nom} créé !`)
      })
      .catch(error => logger.error(error))
    centresInCreation.push(createdSites)
  }

  return Promise.all(centresInCreation)
}
