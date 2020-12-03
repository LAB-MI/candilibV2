/**
 * Fonctionnalités pour initaliser la base de données
 * @module
 */
import { findStatusByType } from '../models/status'
import ModelPlace from '../models/place/place.model'
import { techLogger } from '../util'
import { sortCandilibStatus } from '../models/candidat'
/**
 * Version de la base de données
 */
let versionDB = 0

/**
 * Pour initialisés la base de données
 * - Met à jour les indexes de la collection places
 * @function
 */
export const initDB = async () => {
  const statusVersion = await findStatusByType({ type: 'DB_VERSION' })
  const loggerInfo = {
    section: 'initDB',
    versionDB,
  }

  techLogger.info(loggerInfo)
  if (statusVersion) {
    versionDB = Number(statusVersion.message)
  }

  await ModelPlace.syncIndexes()
}
/**
 * Pour initialisés les status
 * - Met à jour les status de la collection candidat
 * @function
 */
export const initStatus = async () => {
  const nbStatusUpdated = await sortCandilibStatus()
  const loggerInfo = {
    section: 'initStatus',
    nbStatusUpdated,
  }

  techLogger.info(loggerInfo)
}

/**
 * Pour mettre à jours des données de la base de données
 * A utiliser sur des données non modifiable par l'application
 * @function
 */
export const updateDB = async () => {
  // const loggerInfo = {
  //   section: 'updateDB',
  //   versionDB,
  // }
}
