/**
 * Fonctionnalités pour initaliser la base de données
 * @module
 */
import { findStatusByType } from '../models/status'
import ModelPlace from '../models/place/place.model'
import { techLogger } from '../util'
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

  ModelPlace.syncIndexes()
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
