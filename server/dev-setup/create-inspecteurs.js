import { createInspecteur } from '../src/models/inspecteur'

import { simpleLogger as logger } from '../src/util'

import inspecteurs from './inspecteurs'

logger.info('Creating inspecteurs')

export default async () => {
  const inspecteursCreated = inspecteurs.map(inspecteur =>
    createInspecteur(inspecteur)
      .then(inspecteur => {
        logger.info(`Compte inspecteur ${inspecteur.matricule} créé !`)
      })
      .catch(error => logger.error(error))
  )
  return Promise.all(inspecteursCreated)
}
