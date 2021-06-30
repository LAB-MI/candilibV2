import { NB_DAYS_INACTIVITY } from '../../config'
import { removeDuplicateBooked } from '../../initDB/update-places'
import { sortCandilibStatus } from '../../models/candidat'
import { createManyCountStatus } from '../../models/count-status/countStatus-queries'
import { findStatusByType } from '../../models/status/status.queries'
import { appLogger } from '../../util'
import { upsertLastInfosBormeStatus } from './status-candilib-business'

/**
 * Save Count
 * @param {*} countByStatus
 */
const saveCountByStatus = async (countByStatus) => {
  try {
    const countToSave = Object.entries(countByStatus).reduce((acc, [candidatStatus, countByDep]) => {
      const resultsByDep = Object.entries(countByDep).map(([departement, count]) => ({ departement, count, candidatStatus }))
      return [...acc, ...resultsByDep]
    }, [])

    const result = await createManyCountStatus(countToSave)
    return result
  } catch (error) {
    appLogger.warn({
      section: 'SAVE-COUNT-BY-STATUS',
      action: 'FAILED-SAVE',
      description: error.message,
      error,
    })
  }
}

/**
 * Regouper les candidats
 * Sauvegader le resultat pour les calcul des statistiques
 * @async
 */
export const sortStatus = async ({ nbDaysInactivityNeeded }) => {
  const result = await sortCandilibStatus({ nbDaysInactivityNeeded })
  const { countByStatus, updatedCandidat, statusBorne } = result
  await upsertLastInfosBormeStatus(JSON.stringify(statusBorne))
  await saveCountByStatus(countByStatus)
  // TODO: Create a business for this function
  await removeDuplicateBooked()
  return updatedCandidat
}

export const getStatusNbDaysInactivity = async () => {
  await findStatusByType({ type: NB_DAYS_INACTIVITY })
}
