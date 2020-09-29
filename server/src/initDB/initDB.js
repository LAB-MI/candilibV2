import { findStatusByType } from '../models/status'
import ModelPlace from '../models/place/place.model'
import { techLogger } from '../util'

let versionDB = 0
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

export const updateDB = async () => {
  // const loggerInfo = {
  //   section: 'updateDB',
  //   versionDB,
  // }
}
