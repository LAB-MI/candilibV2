import { logger } from '../../util'
import {
  getDatesFromPlacesByCentre,
  getDatesFromPlacesByCentreId,
} from './places.business'

export async function getPlaces (req, res) {
  const _id = req.param('id')
  const centre = req.param('centre')
  const departement = req.param('departement')

  const beginDate = req.param('begin')
  const endDate = req.param('end')

  logger.debug(
    `{section: candidat-getPlaces, departement: ${departement}, id:${_id}, centre:${centre}, date de début:${beginDate}, date de fin: ${endDate} }`
  )

  let dates = []
  try {
    if (_id) {
      dates = await getDatesFromPlacesByCentreId(_id, beginDate, endDate)
    } else {
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
