import { findStatusByType, upsertStatusByType } from '../models/status'
import { updateVisibleAt } from './update-visibleAt'
import { techLogger } from '../util'

let versionDB = 0
export const initDB = async () => {
  const statusVersion = await findStatusByType({ type: 'DB_VERSION' })
  techLogger.info({ statusVersion })
  if (statusVersion) {
    versionDB = Number(statusVersion.message)
  }
}

export const updateDB = async () => {
  const loggerInfo = {
    section: 'updateDB',
    versionDB,
  }
  if (versionDB < 1) {
    setTimeout(async () => {
      const result = await updateVisibleAt()
      techLogger.info({ ...loggerInfo, action: 'UPDATE-VISIBLEAT', descripion: `${result.nModified} modifiés` })
      await upsertStatusByType({ type: 'DB_VERSION', message: ++versionDB })
      techLogger.info({ ...loggerInfo, action: 'UPDATE-VISIBLEAT', descripion: `new version db ${versionDB}` })
    }, 5000)
  }
}
