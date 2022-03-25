import { findArchivedPlaceByIpcsrIdAndDates } from '../../models/archived-place/archived-place-queries'
import { REASON_ABSENT_EXAM, REASON_EXAM_FAILED, statutReasonDictionnary } from '../common/reason.constants'
import { appLogger, EPREUVE_PRATIQUE_OK, NO_CANDILIB } from '../../util'
import { BY_AURIGE } from './business'

export const getArchivePlacesByIpcsrAndDate = async (ipcsr, date, loggerInfo) => {
  const listReasons = [REASON_EXAM_FAILED, REASON_ABSENT_EXAM, EPREUVE_PRATIQUE_OK]
  const byUser = BY_AURIGE

  try {
    const begin = date.startOf('day').toISO()
    const end = date.endOf('day').toISO()

    const places = await findArchivedPlaceByIpcsrIdAndDates({ ipcsrId: ipcsr, begin, end }, true)

    const reasonDictionnary = {
      ...statutReasonDictionnary,
      [EPREUVE_PRATIQUE_OK]: 'Réussi',
      [EPREUVE_PRATIQUE_OK + NO_CANDILIB]: 'Réussi hors de Candilib',
    }
    const placesFound = places.filter(place => place.byUser === byUser && place.archiveReasons.some(reason => listReasons.includes(reason))).map(place => {
      place.archiveReasons = place.archiveReasons.map(reason => reasonDictionnary[reason] || reason)
      return place
    })

    return placesFound
  } catch (error) {
    appLogger.error({ ...loggerInfo, action: 'getArchivePlacesByIpcsrAndDate', description: error.message, error })
    throw new Error("Oups ! Une erreur est survenue dans la recherche. Veuillez contacter l'administrateur")
  }
}
