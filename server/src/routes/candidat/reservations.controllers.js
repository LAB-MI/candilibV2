import { DateTime } from 'luxon'

import { appLogger, techLogger } from '../../util'
import {
  bookPlace,
  getReservationByCandidat,
  removeReservationPlace,
} from './places.business'
import { sendMailConvocation, sendCancelBooking } from '../business'
import {
  SAVE_RESA_WITH_MAIL_SENT,
  SAVE_RESA_WITH_NO_MAIL_SENT,
  CANCEL_RESA_WITH_MAIL_SENT,
  CANCEL_RESA_WITH_NO_MAIL_SENT,
  SAME_RESA_ASKED,
} from './message.constants'

export const getReservations = async (req, res) => {
  const idCandidat = req.userId

  appLogger.debug({
    section: 'candidat-getReservations',
    idCandidat,
  })

  if (!idCandidat) {
    const success = false
    const message = 'Information utilisateur inexistant'

    appLogger.warn({
      section: 'candidat-getReservations',
      idCandidat,
      success,
      message,
    })
    res.status(401).json({
      success,
      message,
    })
  }

  try {
    const bookedPlace = await getReservationByCandidat(idCandidat)
    return res.send(bookedPlace)
  } catch (error) {
    appLogger.error({
      section: 'candidat-getReservations',
      idCandidat,
      error,
    })
    res.status(500).json({
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    })
  }
}

export const setReservations = async (req, res) => {
  const section = 'candidat-setReservations'
  const idCandidat = req.userId
  const { id: center, date, isAccompanied, hasDualControlCar } = req.body

  appLogger.info({
    section,
    idCandidat,
    center,
    date,
    isAccompanied,
    hasDualControlCar,
  })

  if (!center || !date || !isAccompanied || !hasDualControlCar) {
    const msg = []
    if (!center) msg.push(' du centre')
    if (!date) msg.push(' de la date reservation')
    if (!isAccompanied) msg.push(` d'être accompagné`)
    if (!hasDualControlCar) msg.push(` d'avoir un véhicule à double commande`)
    const messageBuild = msg.reduce(
      (a, b, i, array) => a + (i < array.length - 1 ? ',' : ' ou') + b
    )
    const success = false
    const message = `Les informations ${messageBuild} sont manquant`

    appLogger.warn({
      section,
      idCandidat,
      success,
      message,
    })
    return res.status(400).json({
      success,
      message,
    })
  }

  try {
    const previewBookedPlace = await getReservationByCandidat(idCandidat)

    appLogger.debug({
      section,
      idCandidat,
      previewBookedPlace,
    })

    if (
      previewBookedPlace &&
      center === previewBookedPlace.centre._id &&
      DateTime.fromISO(date).equals(
        DateTime.fromJSDate(previewBookedPlace.date)
      )
    ) {
      const success = false
      const message = SAME_RESA_ASKED
      appLogger.warn({
        section,
        idCandidat,
        success,
        message,
      })
      return res.status(200).json({
        success,
        message,
      })
    }

    const reservation = await bookPlace(idCandidat, center, date)
    if (!reservation) {
      const success = false
      const message = "Il n'y a pas de place pour ce créneau"
      appLogger.warn({
        section,
        idCandidat,
        success,
        message,
      })
      return res.status(200).json({
        success,
        message,
      })
    }

    if (previewBookedPlace) {
      try {
        await removeReservationPlace(previewBookedPlace)
      } catch (error) {
        techLogger.error({
          section,
          idCandidat,
          message: 'Echec de suppression de la reservation',
          previewBookedPlace,
          error,
        })
      }
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
      appLogger.warn({
        section: 'candidat-setReservations',
        idCandidat,
        message: `Le courriel de convocation n'a pu être envoyé pour la réservation du candidat ${nomNaissance}/${codeNeph} sur le centre ${nom} du département ${departement} à la date ${date} `,
        error,
      })
      statusmail = false
      message = SAVE_RESA_WITH_NO_MAIL_SENT
    }

    appLogger.info({
      section: 'candidat-setReservations',
      idCandidat,
      statusmail,
      message,
      reservation: reservation._id,
    })
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
    appLogger.error({
      section: 'candidat-setReservations',
      idCandidat,
      error,
    })
    res.status(500).json({
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    })
  }
}

export const removeReservations = async (req, res) => {
  const idCandidat = req.userId

  appLogger.info({
    section: 'candidat-removeReservations',
    idCandidat,
  })
  if (!idCandidat) {
    const success = false
    const message = "Vous n'êtes pas connecté"
    appLogger.warn({
      section: 'candidat-removeReservations',
      idCandidat,
      success,
      message,
    })
    return res.status(401).json({ success, message })
  }

  try {
    const bookedPlace = await getReservationByCandidat(idCandidat, {
      centre: true,
      candidat: true,
    })

    if (!bookedPlace) {
      const success = false
      const message = "Vous n'avez pas de réservation"

      appLogger.warn({
        section: 'candidat-removeReservations',
        idCandidat,
        success,
        message,
      })
      return res.status(401).json({
        success,
        message,
      })
    }

    const candidat = bookedPlace.bookedBy

    await removeReservationPlace(bookedPlace)

    let statusmail = true
    let message = CANCEL_RESA_WITH_MAIL_SENT
    try {
      await sendCancelBooking(candidat)
    } catch (error) {
      appLogger.warn({
        section: 'candidat-removeReservations',
        error,
      })
      statusmail = false
      message = CANCEL_RESA_WITH_NO_MAIL_SENT
    }

    appLogger.info({
      section: 'candidat-removeReservations',
      idCandidat,
      success: true,
      statusmail,
      message,
      place: bookedPlace._id,
    })
    return res.status(200).json({
      success: true,
      statusmail,
      message,
    })
  } catch (error) {
    appLogger.error({
      section: 'candidat-removeReservations',
      error,
    })
    res.status(500).json({
      success: false,
      message: error.message,
      error: JSON.stringify(error),
    })
  }
}
