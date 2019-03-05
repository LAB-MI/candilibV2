import { logger } from '../../util'
import {
  getDatesFromPlacesByCentre,
  getDatesFromPlacesByCentreId,
} from './places.business'

export const ErrorMsgArgEmpty = 'Information du centre sont obligatoires'
/**
 *
 * Si la date de debut (begin) n'est pas définit on recherche à partir de la date courante
 * @param {id, centre, departement, begin, end} req { id: identifiant du centre, centre: nom du centre, departement: département reherché, begin: date du début de recherche, end : date de fin de recherche}
 * @param {*} res
 */
export async function getPlaces (req, res) {
  const _id = req.param('id')
  const centre = req.param('centre')
  const departement = req.param('departement')

  const beginDate = req.param('begin')
  const endDate = req.param('end')

  logger.debug(
    JSON.stringify({
      section: 'candidat-getPlaces',
      argument: { departement, _id, centre, beginDate, endDate },
    })
  )

  let dates = []
  try {
    if (_id) {
      dates = await getDatesFromPlacesByCentreId(_id, beginDate, endDate)
    } else {
      if (!(departement && centre)) {
        throw new Error(ErrorMsgArgEmpty)
      }
      dates = await getDatesFromPlacesByCentre(
        departement,
        centre,
        beginDate,
        endDate
      )
    }
    res.status(200).json(dates)
  } catch (error) {
    logger.error(error)
    res.status(500).json({
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    })
  }
}
