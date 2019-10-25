import { appLogger, techLogger } from '../../util'

import {
  addInfoDateToRulesResa,
  bookPlace,
  getLastDateToCancel,
  getReservationByCandidat,
  removeReservationPlace,
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
  const candidatId = req.userId
  const { bymail, lastDateOnly } = req.query

  appLogger.debug({
    section,
    candidatId,
    bymail,
  })

  if (!candidatId) {
    const success = false
    const message = USER_INFO_MISSING

    appLogger.warn({
      section,
      candidatId,
      bymail,
      success,
      description: message,
    })
    res.status(401).json({
      success,
      message,
    })
  }

  try {
    const bookedPlace = await getReservationByCandidat(
      candidatId,
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
          candidatId,
          bymail,
          success,
          description: message,
          error,
        })
      }

      appLogger.info({
        section,
        candidatId,
        bymail,
        success,
        description: message,
      })

      return res.json({
        success,
        message,
      })
    } else {
      let reservation = {}
      if (bookedPlace) {
        const { _id, centre, date } = bookedPlace

        const lastDateToCancel = getLastDateToCancel(date)

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

      reservation = await addInfoDateToRulesResa(candidatId, reservation)

      appLogger.info({
        section,
        action: 'get-reservations',
        candidatId,
        bymail,
        placeId: reservation && reservation._id,
      })
      return res.json(reservation)
    }
  } catch (error) {
    appLogger.error({
      section: 'candidat-get-reservations',
      candidatId,
      bymail,
      error,
    })
    res.status(500).json({
      success: false,
      message: 'Impossible de récupérer les réservations',
    })
  }
}

export const createReservation = async (req, res) => {
  const candidatId = req.userId
  const { id: centreId, date, isAccompanied, hasDualControlCar } = req.body

  const loggerInfo = {
    section: 'candidat-create-reservation',
    candidatId,
    centreId,
    date,
    isAccompanied,
    hasDualControlCar,
  }
  if (!centreId || !date || !isAccompanied || !hasDualControlCar) {
    const msg = []
    if (!centreId) msg.push(' du centre')
    if (!date) msg.push(' de la date reservation')
    if (!isAccompanied) msg.push(" d'être accompagné")
    if (!hasDualControlCar) msg.push(" d'avoir un véhicule à double commande")
    const messageList = msg.join(',')
    const success = false
    const message = `Une ou plusieurs informations sont manquantes : ${messageList}`

    appLogger.warn({
      ...loggerInfo,
      success,
      description: message,
    })
    return res.status(400).json({
      success,
      message,
    })
  }

  try {
    const previewBookedPlace = await getReservationByCandidat(candidatId, {
      centre: true,
      candidat: true,
    })
    appLogger.info({
      ...loggerInfo,
      action: 'get-reservation',
      previewBookedPlace,
    })

    const statusValidResa = await validCentreDateReservation(
      candidatId,
      centreId,
      date,
      previewBookedPlace
    )

    if (statusValidResa) {
      appLogger.warn({
        ...loggerInfo,
        action: 'valid-reservation',
        statusValidResa,
      })
      return res.status(400).json({
        success: statusValidResa.success,
        message: statusValidResa.message,
      })
    }

    const reservation = await bookPlace(candidatId, centreId, date)
    if (!reservation) {
      const success = false
      const message = "Il n'y a pas de place pour ce créneau"
      appLogger.warn({
        ...loggerInfo,
        action: 'NO_PLACES',
        success,
        description: message,
      })
      return res.status(400).json({
        success,
        message,
      })
    }

    let statusmail
    let message = ''
    let statusRemove
    let dateAfterBook

    if (previewBookedPlace) {
      try {
        statusRemove = await removeReservationPlace(
          previewBookedPlace,
          true,
          loggerInfo
        )
        dateAfterBook = statusRemove.dateAfterBook
      } catch (error) {
        techLogger.error({
          ...loggerInfo,
          action: 'FAILED_REMOVE_BOOKING',
          description: 'Échec de suppression de la réservation',
          previewBookedPlace,
          error,
        })
      }
    }

    try {
      await sendMailConvocation(reservation)
      statusmail = true
      message = SAVE_RESA_WITH_MAIL_SENT
    } catch (error) {
      const { nomNaissance, codeNeph } = reservation.candidat
      const { nom, departement } = reservation.centre
      const { date } = reservation
      appLogger.warn({
        ...loggerInfo,
        action: 'FAILED_SEND_MAIL',
        description: `Le courriel de convocation n'a pu être envoyé pour la réservation du candidat ${nomNaissance}/${codeNeph} sur le centre ${nom} du département ${departement} à la date ${date} `,
        error,
      })
      statusmail = false
      message = SAVE_RESA_WITH_NO_MAIL_SENT
    }

    appLogger.info({
      ...loggerInfo,
      action: 'CREATED_BOOKING',
      statusmail,
      description: message,
      reservation: reservation._id,
    })
    return res.status(201).json({
      success: true,
      reservation: {
        date: reservation.date,
        centre: reservation.centre.nom,
        departement: reservation.centre.departement,
        isBooked: true,
      },
      statusmail,
      message,
      dateAfterBook,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      action: 'FAILD_CREATED_BOOKING',
      description: error.message,
      error,
    })
    res.status(500).json({
      success: false,
      message:
        "Une erreur est survenue : Impossible de réserver la place. L'administrateur du site a été prévenu",
    })
  }
}

export const removeReservation = async (req, res) => {
  const candidatId = req.userId

  const loggerInfo = {
    section: 'candidat-remove-reservations',
    candidatId,
  }
  if (!candidatId) {
    const success = false
    const message = USER_INFO_MISSING
    appLogger.warn({
      ...loggerInfo,
      action: 'NO_CANDIDAT',
      success,
      description: message,
    })
    return res.status(401).json({ success, message })
  }

  try {
    const bookedPlace = await getReservationByCandidat(candidatId, {
      centre: true,
      candidat: true,
    })

    if (!bookedPlace) {
      const success = false
      const message = "Vous n'avez pas de réservation"

      appLogger.warn({
        ...loggerInfo,
        action: 'NO_FIND_RESA',
        candidatId,
        success,
        description: message,
      })
      return res.status(401).json({
        success,
        message,
      })
    }

    const status = await removeReservationPlace(bookedPlace, false, loggerInfo)

    appLogger.info({
      ...loggerInfo,
      action: 'REMOVED_BOOKING',
      result: {
        ...status,
        success: true,
      },
    })
    return res.status(200).json({
      success: true,
      ...status,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      action: 'UNKNOWN ERROR',
      description: error.message,
      error,
    })
    res.status(500).json({
      success: false,
      message:
        "Une erreur est survenue : impossible de supprimer votre réservation. L'administrateur du site a été prévenu",
    })
  }
}
