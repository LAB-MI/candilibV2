import { appLogger } from '../../util'
import {
  getDatesByCentre,
  getDatesByCentreId,
  hasAvailablePlaces,
  hasAvailablePlacesByCentre,
} from './places.business'

export const ErrorMsgArgEmpty = 'Information du centre sont obligatoires'
/**
 *
 * Si la date de debut (begin) n'est pas définit on recherche à partir de la date courante
 * @param {id, centre, departement, begin, end} req { id: identifiant du centre, centre: nom du centre, departement: département reherché, begin: date du début de recherche, end : date de fin de recherche}
 * @param {*} res
 */
export async function getPlaces (req, res) {
  const _id = req.params.id

  const { centre, departement, end, date } = req.query

  if (end && date) {
    const error = {
      section: 'candidat-getPlaces',
      message:
        '(begin , end) et date ne peuvent avoir des valeurs en même temps',
    }
    appLogger.error(error)
    res.status(409).json({
      success: false,
      message: error.message,
    })
  }

  appLogger.debug({
    section: 'candidat-getPlaces',
    argument: { departement, _id, centre, end, date },
  })

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
    appLogger.error(error)
    res.status(error.message === ErrorMsgArgEmpty ? 400 : 500).json({
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    })
  }
}
