import { logger } from '../../util'
import { bookPlace, getReservationByCandidat } from './places.business'
import { sendMailConvocation } from '../business'
import {
  SAVE_RESA_WITH_MAIL_SENT,
  SAVE_RESA_WITH_NO_MAIL_SENT,
} from './message.constants'

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
    const bookedPlace = await getReservationByCandidat(idCandidat)
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
    return res.status(400).json({
      success: false,
      message: `Les informations ${message} sont manquant`,
    })
  }

  try {
    // const bookedPlace = await findPlaceBookedByCandidat(idCandidat)

    const reservation = await bookPlace(idCandidat, center, date)
    if (!reservation) {
      return res.status(200).json({
        success: false,
        message: "Il n'y a pas de place pour ce créneau",
      })
    }

    let statusmail
    let message = ''
    try {
      await sendMailConvocation(reservation)
      statusmail = true
      message = SAVE_RESA_WITH_MAIL_SENT
    } catch (error) {
      const { nomNaissance, codeNeph } = reservation.bookedBy
      const { nom, departement } = reservation.centre
      const { date } = reservation
      logger.warn(
        `Le courriel de convocation n'a pu être envoyé pour la réservation du candidat ${nomNaissance}/${codeNeph} sur le centre ${nom} du département ${departement} à la date ${date} `
      )
      logger.error(error)
      statusmail = false
      message = SAVE_RESA_WITH_NO_MAIL_SENT
    }

    // if (bookedPlace) cancelReservationPlace(bookedPlace._id)
    return res.status(200).json({
      success: true,
      reservation: {
        date: reservation.date,
        centre: reservation.centre.nom,
        departement: reservation.centre.departement,
        isBooked: reservation.isBooked,
      },
      statusmail,
      message,
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
