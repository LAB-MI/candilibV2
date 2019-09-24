/**
 * Modules concernant les actions possibles du candidat sur les places
 * @module routes/candidat/places-controllers
 */

import { appLogger } from '../../util'
import {
  getDatesByCentre,
  getDatesByCentreId,
  hasAvailablePlaces,
  hasAvailablePlacesByCentre,
} from './places.business'

export const ErrorMsgArgEmpty =
  'Les paramètres du centre et du département sont obligatoires'

/**
 * Retourne soit la place dont l'Id est
 * Si la date de debut (begin) n'est pas définie on recherche à partir de la date courante
 *
 * @async
 * @function getPlaces
 * @see {@link http://localhost:8000/api-docs/#/default/get_candidat_places__placeId_}

 * @param {object} req Est attendu dans la requête :
 * ```javascript
 * {
 *   params: { id : "identifiant du centre" },
 *   query: {
 *     begin: "date du début de recherche",
 *     end : "date de fin de recherche",
 *   }
 * }
 * ```
 * Ou bien
 * ```javascript
 * {
 *   query: {
 *     centre: "nom du centre",
 *     departement: "département reherché",
 *     begin: "date du début de recherche",
 *     end : "date de fin de recherche",
 *   }
 * }
 * ```
 * Ou bien
 * ```javascript
 * {
 *   params: { id : "identifiant du centre" },
 *   query: {
 *     date : "date du jour de recherche",
 *   }
 * }
 * ```
 * @param {object} res
 */
export async function getPlaces (req, res) {
  const _id = req.params.id

  const { centre, departement, end, date } = req.query

  if (end && date) {
    const message = 'end et date ne peuvent avoir des valeurs en même temps'
    appLogger.warn({
      section: 'candidat-getPlaces',
      description: message,
    })
    res.status(409).json({
      success: false,
      message: message,
    })
  }

  const loggerInfo = {
    section: 'candidat-getPlaces',
    argument: { departement, _id, centre, end, date },
  }

  appLogger.debug(loggerInfo)

  let dates = []
  try {
    if (_id) {
      if (date) {
        dates = await hasAvailablePlaces(_id, date)
      } else {
        dates = await getDatesByCentreId(_id, end)
      }
    } else {
      if (!(departement && centre)) {
        throw new Error(ErrorMsgArgEmpty)
      }
      if (date) {
        dates = await hasAvailablePlacesByCentre(departement, centre, date)
      } else {
        dates = await getDatesByCentre(departement, centre, end)
      }
    }
    res.status(200).json(dates)
  } catch (error) {
    appLogger.error({ ...loggerInfo, error, description: error.message })
    res.status(error.message === ErrorMsgArgEmpty ? 400 : 500).json({
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    })
  }
}
