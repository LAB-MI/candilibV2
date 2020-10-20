import { appLogger } from '../../util'
import { UNKNOWN_ERROR_GET_DEPARTEMENT } from '../admin/message.constants'

import { findCentresWithNbPlacesByGeoDepartement } from '../common/centre-business'
import { candidatCanReservePlaceForThisPeriod } from './util'

/**
 * Récupérer les nombres places par géo-département et par centres
 * @async
 * @function
 *
 * @param {array} geoDepartementsId Liste d'id par geoDepartement
 * @param {string} userId Id de l'utilisateur candidat
 * @return {geoDepartementsInfo[]} Liste contenant les nombres de places par centres et par geo-deaprtements
 */
export const getGeoDepartementsInfos = async (geoDepartementsId, userId) => {
  const loggerContent = {
    action: 'Getting active geo departements business',
    section: 'candidat-departements-business',
    userId,
    geoDepartementsId,
  }

  try {
    const {
      beginPeriod,
      endPeriod,
    } = await candidatCanReservePlaceForThisPeriod(userId)

    const geoDepartementsInfos = await Promise.all(
      geoDepartementsId.map(async geoDepartement => {
        const centresInfos = await findCentresWithNbPlacesByGeoDepartement(
          geoDepartement,
          beginPeriod,
          endPeriod,
        )

        const someOfCountPlaces = centresInfos.reduce(
          (sumCount, { count }) => sumCount + count,
          0,
        )

        const shapedGeoDepartementInfo = {
          geoDepartement,
          centres: centresInfos,
          count: someOfCountPlaces,
        }
        return shapedGeoDepartementInfo
      }),
    )
    return geoDepartementsInfos
  } catch (error) {
    appLogger.error({
      ...loggerContent,
      error,
      description: error.message,
    })

    throw new Error(UNKNOWN_ERROR_GET_DEPARTEMENT)
  }
}

/**
*  @typedef {Object} geoDepartementsInfo
*  @property {string} geoDepartement - Identifiant du géo-département
*  @property {array} centres - Liste des des centres du géo-département
*  @property {number} count - Total de places
*/
