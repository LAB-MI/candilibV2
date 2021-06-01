/**
 * Fonctionnalités pour initaliser la base de données
 * @module
 */
import { findStatusByType, upsertStatusByType } from '../models/status'
import ModelPlace from '../models/place/place.model'
import ModelCandidat from '../models/candidat/candidat.model'
import { techLogger, versionSepparator } from '../util'
import { sortStatus } from '../routes/admin/sort-candidat-status-business'
import { removeDuplicateBooked } from './update-places'
import npmVersion from '../../package.json'
import { NB_DAYS_INACTIVITY } from '../config'

const runJobs = async () => {
  await ModelPlace.syncIndexes()
  await ModelCandidat.syncIndexes()
  await removeDuplicateBooked()
}
/**
 * Version de la base de données
 */
// let versionDB = 0

/**
 * Pour initialisés la base de données
 * - Met à jour les indexes de la collection places
 * @function
 */
// TODO: Les Jobs ne se lance que a la livraison sauf pour la qualif


export const initDB = async () => {
  const versionDB = npmVersion.version.split(versionSepparator)
  const statusVersion = await findStatusByType({ type: 'DB_VERSION' })

  const loggerInfo = {
    section: 'initDB',
    versionDB,
    statusVersion: statusVersion?.message,
    description: 'INIT',
  }

  const isAlwaysTrue = !statusVersion?.message
  if (isAlwaysTrue || statusVersion.message !== npmVersion.version) {
    await runJobs()

    if (isAlwaysTrue || statusVersion.message < 'v2.11.9') await upsertStatusByType({ type: NB_DAYS_INACTIVITY, message: 90 })

    await upsertStatusByType({ type: 'DB_VERSION', message: versionDB })
    loggerInfo.description = 'UPDATED'
  }

  techLogger.info(loggerInfo)

  if (versionDB[1]) {
    // CONCERN ONLY QUALIF
    await runJobs()
    await upsertStatusByType({ type: 'DB_VERSION', message: versionDB[0] })
  } else {
    // CONCERN ONLY PROD
    if (!statusVersion?.message || (versionDB[0] > statusVersion.message)) {
      await runJobs()
      await upsertStatusByType({ type: 'DB_VERSION', message: versionDB[0] })
    }
  }
}

/**
 * Pour initialisés les status
 * - Met à jour les status de la collection candidat
 * @function
 */
export const initStatus = async () => {
  // TODO: MOOVE NEXT `sortStatus` FUNCTION IN COMMON DIRECTORY
  const nbStatusUpdated = await sortStatus({ nbDaysInactivityNeeded: 0 })
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
