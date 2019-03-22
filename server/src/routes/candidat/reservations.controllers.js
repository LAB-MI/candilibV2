import { appLogger, techLogger } from '../../util'
import {
  bookPlace,
  getReservationByCandidat,
  removeReservationPlace,
  getLastDateToCancel,
  validCentreDateReservation,
} from './places.business'
import { sendMailConvocation } from '../business'
import {
  SAVE_RESA_WITH_MAIL_SENT,
  SAVE_RESA_WITH_NO_MAIL_SENT,
  SEND_MAIL_ASKED,
  FAILED_SEND_MAIL_ASKED,
  SEND_MAIL_ASKED_RESA_EMPTY,
  USER_INFO_MISSING,
} from './message.constants'

export const getReservations = async (req, res) => {
  const section = 'candidat-getReservations'
  const idCandidat = req.userId
  const { bymail, lastDateOnly } = req.query

  appLogger.debug({
    section,
    idCandidat,
    bymail,
  })

  if (!idCandidat) {
    const success = false
    const message = USER_INFO_MISSING

    appLogger.warn({
      section,
      idCandidat,
      bymail,
      success,
      message,
    })
    res.status(401).json({
      success,
      message,
    })
  }

  try {
    const bookedPlace = await getReservationByCandidat(
      idCandidat,
      bymail ? { centre: true, candidat: true } : undefined
    )

    if (bymail) {
      let success
      let message

      if (!bookedPlace) {
        success = false
        message = SEND_MAIL_ASKED_RESA_EMPTY
      }
      try {
        await sendMailConvocation(bookedPlace)
        success = true
        message = SEND_MAIL_ASKED
      } catch (error) {
        success = false
        message = FAILED_SEND_MAIL_ASKED

        techLogger.error({
          section,
          idCandidat,
          bymail,
          success,
          message,
          error,
        })
      }

      appLogger.info({
        section,
        idCandidat,
        bymail,
        success,
        message,
      })

      return res.json({
        success,
        message,
      })
    } else {
      let reservation = {}
      if (bookedPlace) {
        const { _id, centre, date } = bookedPlace
        const lastDateToCancel = getLastDateToCancel(bookedPlace.date)

        if (lastDateOnly) {
          return res.json({ lastDateToCancel })
        }

        reservation = {
          _id,
          centre,
          date,
          lastDateToCancel,
        }
      }

      appLogger.info({
        section,
        idCandidat,
        bymail,
        place: reservation && reservation._id,
      })
      return res.json(reservation)
    }
  } catch (error) {
    appLogger.error({
      section: 'candidat-getReservations',
      idCandidat,
      bymail,
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
  const { id: centre, date, isAccompanied, hasDualControlCar } = req.body

  appLogger.info({
    section,
    idCandidat,
    centre,
    date,
    isAccompanied,
    hasDualControlCar,
  })

  if (!centre || !date || !isAccompanied || !hasDualControlCar) {
    const msg = []
    if (!centre) msg.push(' du centre')
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
    const previewBookedPlace = await getReservationByCandidat(idCandidat, {
      centre: true,
      candidat: true,
    })
    appLogger.debug({
      section,
      idCandidat,
      previewBookedPlace,
    })

    const statusValidResa = await validCentreDateReservation(
      idCandidat,
      centre,
      date,
      previewBookedPlace
    )

    if (statusValidResa) {
      appLogger.warn({
        section,
        idCandidat,
        statusValidResa,
      })
      return res.status(400).json({
        success: statusValidResa.success,
        message: statusValidResa.message,
      })
    }

    const reservation = await bookPlace(idCandidat, centre, date)
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
    const message = USER_INFO_MISSING
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

    const status = await removeReservationPlace(bookedPlace)

    return res.status(200).json({
      success: true,
      ...status,
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
