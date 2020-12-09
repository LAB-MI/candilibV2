import { sortCandilibStatus } from '../../models/candidat'
import { createManyCountStatus } from '../../models/count-status/countStatus-queries'
import { appLogger } from '../../util'

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
export const sortStatus = async () => {
  const result = await sortCandilibStatus()
  const { countByStatus, updatedCandidat } = result
  await saveCountByStatus(countByStatus)

  return updatedCandidat
}
