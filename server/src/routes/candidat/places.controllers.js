/**
 * Modules concernant les actions possibles du candidat sur les places
 * @module routes/candidat/places-controllers
 */

import { appLogger, techLogger } from '../../util'
import {
  addInfoDateToRulesResa,
  bookPlace,
  getDatesByCentre,
  getDatesByCentreId,
  getLastDateToCancel,
  getReservationByCandidat,
  hasAvailablePlaces,
  hasAvailablePlacesByCentre,
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
export async function getPlacesByCentre (req, res) {
  const centreId = req.params.id

  const { centre: nomCentre, departement, begin, end, dateTime } = req.query

  const loggerInfo = {
    section: 'candidat-getPlacesByCentre',
    argument: { departement, centreId, nomCentre, begin, end, dateTime },
  }

  if (end && dateTime) {
    const message =
      'Conflit dans les paramètres de la requête au serveur: end et date ne peuvent avoir des valeurs en même temps'
    appLogger.warn({
      ...loggerInfo,
      description: message,
    })
    res.status(400).json({
      success: false,
      message: message,
    })
  }

  let dates = []
  try {
    if (centreId) {
      if (dateTime) {
        dates = await hasAvailablePlaces(centreId, dateTime)
      } else {
        dates = await getDatesByCentreId(centreId, begin, end)
      }
    } else {
      if (!(departement && nomCentre)) {
        throw new Error(ErrorMsgArgEmpty)
      }
      if (dateTime) {
        dates = await hasAvailablePlacesByCentre(
          departement,
          nomCentre,
          dateTime
        )
      } else {
        dates = await getDatesByCentre(departement, nomCentre, begin, end)
      }
    }

    appLogger.info({
      ...loggerInfo,
      description: `[${dates.length}] place(s) ont été trouvée(s)`,
    })

    res.status(200).json(dates)
  } catch (error) {
    appLogger.error({ ...loggerInfo, error, description: error.message })
    res.status(error.message === ErrorMsgArgEmpty ? 400 : 500).json({
      success: false,
      message: error.message,
    })
  }
}

export const getPlaces = async (req, res) => {
  const { id } = req.params

  const { centre, departement, begin, end, dateTime } = req.query
  if (id || dateTime || departement || centre || begin || end) {
    await getPlacesByCentre(req, res)
  } else {
    await getBookedPlaces(req, res)
  }
}

export const getBookedPlaces = async (req, res) => {
  const section = 'candidat-getBookedPlaces'
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
        place: reservation && reservation._id,
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

export const bookPlaceByCandidat = async (req, res) => {
  const section = 'candidat-create-reservation'
  const candidatId = req.userId
  const { id: centre, date, isAccompanied, hasDualControlCar } = req.body

  appLogger.info({
    section,
    candidatId,
    centre,
    date,
    isAccompanied,
    hasDualControlCar,
  })

  if (!centre || !date || !isAccompanied || !hasDualControlCar) {
    const msg = []
    if (!centre) msg.push(' du centre')
    if (!date) msg.push(' de la date reservation')
    if (!isAccompanied) msg.push(" d'être accompagné")
    if (!hasDualControlCar) msg.push(" d'avoir un véhicule à double commande")
    const messageList = msg.join(',')
    const success = false
    const message = `Une ou plusieurs informations sont manquantes : ${messageList}`

    appLogger.warn({
      section,
      candidatId,
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
      section,
      action: 'get-reservation',
      candidatId,
      previewBookedPlace,
    })

    const statusValidResa = await validCentreDateReservation(
      candidatId,
      centre,
      date,
      previewBookedPlace
    )

    if (statusValidResa) {
      appLogger.warn({
        section,
        action: 'valid-reservation',
        candidatId,
        statusValidResa,
      })
      return res.status(400).json({
        success: statusValidResa.success,
        message: statusValidResa.message,
      })
    }

    const reservation = await bookPlace(candidatId, centre, date)
    if (!reservation) {
      const success = false
      const message = "Il n'y a pas de place pour ce créneau"
      appLogger.warn({
        section,
        candidatId,
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
        statusRemove = await removeReservationPlace(previewBookedPlace, true)
        dateAfterBook = statusRemove.dateAfterBook
      } catch (error) {
        techLogger.error({
          section,
          candidatId,
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
        section: 'candidat-create-reservation',
        candidatId,
        description: `Le courriel de convocation n'a pu être envoyé pour la réservation du candidat ${nomNaissance}/${codeNeph} sur le centre ${nom} du département ${departement} à la date ${date} `,
        error,
      })
      statusmail = false
      message = SAVE_RESA_WITH_NO_MAIL_SENT
    }

    appLogger.info({
      section: 'candidat-create-reservation',
      action: 'create-reservation',
      candidatId,
      statusmail,
      description: message,
      reservation: reservation._id,
    })
    return res.status(200).json({
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
      section: 'candidat-create-reservation',
      candidatId,
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

export const unbookPlace = async (req, res) => {
  const candidatId = req.userId

  appLogger.info({
    section: 'candidat-remove-reservations',
    action: 'REMOVE_RESA_ARGS',
    candidatId,
  })
  if (!candidatId) {
    const success = false
    const message = USER_INFO_MISSING
    appLogger.warn({
      section: 'candidat-remove-reservations',
      action: 'NO_CANDIDAT',
      candidatId,
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
        section: 'candidat-unbookPlace',
        action: 'remove-reservation',
        candidatId,
        success,
        description: 'NO_PLACE',
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
      section: 'candidat-remove-reservations',
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
