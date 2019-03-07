import { logger } from '../../util'
import { findPlaceBookedByCandidat } from '../../models/place'
import { saveReservationOnePlace } from './places.business'

export const getReservations = async (req, res) => {
  const idCandidat = req.userId

  logger.debug(
    JSON.stringify({
      section: 'candidat-getReservations',
      argument: { idCandidat },
    })
  )

  if (!idCandidat) {
    res.status(401).json({
      success: false,
      message: 'Information utilisateur inexistant',
    })
  }

  try {
    const bookedPlace = await findPlaceBookedByCandidat(idCandidat)
    return res.send(bookedPlace)
  } catch (error) {
    logger.error(error)
    res.status(500).json({
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    })
  }
}

export const setReservations = async (req, res) => {
  const idCandidat = req.userId
  const center = req.param('id')
  const date = req.param('date')
  const isAccompanied = req.param('isAccompanied')
  const hasDualControlCar = req.param('hasDualControlCar')

  logger.info(
    JSON.stringify({
      section: 'candidat-setReservations',
      argument: { idCandidat, center, date, isAccompanied, hasDualControlCar },
    })
  )

  if (!center || !date || !isAccompanied || !hasDualControlCar) {
    const msg = []
    if (!center) msg.push(' du centre')
    if (!date) msg.push(' de la date reservation')
    if (!isAccompanied) msg.push(` d'être accompagné`)
    if (!hasDualControlCar) msg.push(` d'avoir un véhicule à double commande`)
    const message = msg.reduce(
      (a, b, i, array) => a + (i < array.length - 1 ? ',' : ' ou') + b
    )
    res.status(400).json({
      success: false,
      message: `Les informations ${message} sont manquant`,
    })
  }

  try {
    // const bookedPlace = await findPlaceBookedByCandidat(idCandidat)

    const reservation = saveReservationOnePlace(idCandidat, center, date)
    if (!reservation) {
      return res.status(200).json({
        success: false,
        message: "Il n'y a pas de place pour ce créneau",
      })
    }
    // if (bookedPlace) cancelReservationPlace(bookedPlace._id)
    return res.status(200).json({
      success: true,
      reservation,
    })
  } catch (error) {
    logger.error(error)
    res.status(500).json({
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    })
  }
}
