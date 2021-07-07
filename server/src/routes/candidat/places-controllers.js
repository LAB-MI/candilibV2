/**
 * Modules concernant les actions possibles du candidat sur les places
 * @module routes/candidat/places-controllers
 */

import { appLogger, techLogger } from '../../util'
import {
  addInfoDateToRulesResa,
  bookPlace,
  getLastDateToCancel,
  getPlacesByDepartementAndCentre,
  getReservationByCandidat,
  hasAvailablePlacesByCentre,
  removeReservationPlace,
  validCentreDateReservation,
  canModifyReservation,
  hasBooking,
} from './places-business'

import { sendMailConvocation } from '../business'
import {
  SAVE_RESA_WITH_MAIL_SENT,
  SAVE_RESA_WITH_NO_MAIL_SENT,
  SEND_MAIL_ASKED,
  FAILED_SEND_MAIL_ASKED,
  SEND_MAIL_ASKED_RESA_EMPTY,
  USER_INFO_MISSING,
  CANDIDAT_MUST_CANCEL_BOOKING,
} from './message.constants'
import { updateCandidatDepartement } from '../../models/candidat'
import { getStatusWithRecentlyDept } from '../common/candidat-status'

export const ErrorMsgArgEmpty =
  'Les paramètres du centre et du département sont obligatoires'

/**
 * Retourne soit les dates des places disponibles d'un centre soit par son identifiant soit par son nom et son département
 * Si la date de debut (begin) n'est pas définie on recherche à partir de la date courante
 *
 * @async
 * @function
 * @see {@link http://localhost:8000/api-docs/#/Candidat/get_candidat_places__centreId| Swagger GET candidat/places/:id?}
 * @param {import('express').Request} req - Est attendu dans la requête :
 * @param {Object} req.params - Paramètres de la route
 * @param {string=} req.params.id - Identifiant du centre
 * @param {Object=} req.query - Paramètres de la requête
 * @param {string=} req.query.departement - Numéro du département
 * @param {string=} req.query.centre - Nom du centre
 * @param {string=} req.query.date - Date du jour de recherche au format ISO
 * @param {string=} req.query.begin - Date du début de recherche au format ISO
 * @param {string=} req.query.end - Date de fin de recherche au format ISO
 *
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
 * @param {import('express').Response} res
 */
export async function getPlacesByCentre (req, res) {
  const centreId = req.params.id
  const candidatId = req.userId
  const candidatStatus = req.candidatStatus
  const homeDepartement = req.candidatHomeDepartement
  const isInRecentlyDept = req.isInRecentlyDept

  const { nomCentre, geoDepartement, begin, end, dateTime } = req.query

  const loggerInfo = {
    request_id: req.request_id,
    section: 'candidat-getPlacesByCentre',
    geoDepartement,
    centreId,
    nomCentre,
    begin,
    end,
    dateTime,
    candidatId,
  }

  const hadBooking = await hasBooking(candidatId)
  if (hadBooking) {
    const message = CANDIDAT_MUST_CANCEL_BOOKING
    appLogger.warn({
      ...loggerInfo,
      description: message,
    })
    res.status(400).json({
      success: false,
      message: message,
    })
    return
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
    if (!(geoDepartement && nomCentre)) {
      throw new Error(ErrorMsgArgEmpty)
    }
    if (dateTime) {
      dates = await hasAvailablePlacesByCentre(
        geoDepartement,
        nomCentre,
        dateTime,
        getStatusWithRecentlyDept(candidatStatus, geoDepartement, homeDepartement, isInRecentlyDept),
      )
    } else {
      dates = await getPlacesByDepartementAndCentre(
        nomCentre,
        geoDepartement,
        candidatId,
        begin,
        end,
        getStatusWithRecentlyDept(candidatStatus, geoDepartement, homeDepartement, isInRecentlyDept),
      )
    }

    appLogger.info({
      ...loggerInfo,
      description: `[${dates?.length}] place(s) ont été trouvée(s)`,
    })

    res.status(200).json(dates || [])
  } catch (error) {
    appLogger.error({ ...loggerInfo, error, description: error.message })
    res.status(error.message === ErrorMsgArgEmpty ? 400 : 500).json({
      success: false,
      message: error.message,
    })
  }
}
/**
 * Cette fonction renvoie :
 * - la réservation du candidat (voir {@link import('./places-controllers')..getBookedPlaces|getBookedPlaces})
 * - ou la liste des dates des places disponibles {voir {@link import('./places-controllers')..getPlacesByCentre|getPlacesByCentre}}
 * @async
 * @function
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @see {@link import('./places-controllers')..getBookedPlaces|getBookedPlaces}
 * @see {@link import('./places-controllers')..getPlacesByCentre|getPlacesByCentre}
 * @see {@link http://localhost:8000/api-docs/#/Candidat/get_candidat_places| Swagger GET candidat/places}
 * @see {@link http://localhost:8000/api-docs/#/Candidat/get_candidat_places__centreId| Swagger GET candidat/places/:id?}
 */
export const getPlaces = async (req, res) => {
  const { id } = req.params

  const {
    centre,
    departement,
    begin,
    end,
    dateTime,
    nomCentre,
    geoDepartement,
  } = req.query
  if (
    id ||
    nomCentre ||
    dateTime ||
    departement ||
    geoDepartement ||
    centre ||
    begin ||
    end
  ) {
    await getPlacesByCentre(req, res)
  } else {
    await getBookedPlaces(req, res)
  }
}

/**
 * Retourne ou envoi par mail la réservation du candidat
 * @async
 * @function
 * @param {import('express').Request} req
 * @param {string} req.userId - Identifiant du candidat
 * @param {Obejt} req.query
 * @param {boolean} req.query.byMail - Indicateur pour envoyer par mail
 * @param {boolean} req.query.lastDateOnly - Indication pour récupérer la date dont le candidat n'a plus droit d'annuler
 * @param {import('express').Response} res
 * @see {@link http://localhost:8000/api-docs/#/Candidat/get_candidat_places| Swagger GET candidat/places}
 */
export const getBookedPlaces = async (req, res) => {
  const section = 'candidat-getBookedPlaces'
  const candidatId = req.userId
  const { byMail, lastDateOnly } = req.query

  // appLogger.debug({
  //   section,
  //   candidatId,
  //   byMail,
  // })

  if (!candidatId) {
    const success = false
    const message = USER_INFO_MISSING

    appLogger.warn({
      section,
      candidatId,
      byMail,
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
      byMail ? { centre: true, candidat: true } : undefined,
    )

    if (byMail) {
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
          byMail,
          success,
          description: message,
          error,
        })
      }

      appLogger.info({
        section,
        candidatId,
        byMail,
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

        const lastDateToCancel = getLastDateToCancel(date).toISODate()

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
        byMail,
        placeId: reservation && reservation._id,
      })
      return res.json(reservation)
    }
  } catch (error) {
    appLogger.error({
      request_id: req.request_id,
      section: 'candidat-get-reservations',
      candidatId,
      byMail,
      error,
    })
    res.status(500).json({
      success: false,
      message: 'Impossible de récupérer les réservations',
    })
  }
}

function isMissingPrerequesite (nomCentre, date, isAccompanied, hasDualControlCar) {
  return !nomCentre || !date || !isAccompanied || !hasDualControlCar
}

/**
 * Marque une place comme réservée par le candidat
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req - Requête
 * @param {string} req.userId - Identifiant du candidat
 * @param {Object} req.body - Corps de la requête
 * @param {string} req.body.id - Identifiant du centre choisi
 * @param {string} req.body.date - Date de la place choisi
 * @param {boolean} req.body.isAccompanied - Indicateur pour confirmer la présence d'un accompagnateur
 * @param {boolean} req.body.hasDualControlCar - Indicateur pour confirmer possession d'un véhicule à double commande
 * @param {import('express').Response} res - Réponse
 * @see {@link http://localhost:8000/api-docs/#/Candidat/patch_candidat_places| swagger PATCH /candidat/places}
 */
export const bookPlaceByCandidat = async (req, res) => {
  const section = 'candidat-create-reservation'
  const candidatId = req.userId
  const candidatStatus = req.candidatStatus
  const homeDepartement = req.candidatHomeDepartement
  const isInRecentlyDept = req.isInRecentlyDept

  const {
    nomCentre,
    geoDepartement,
    date,
    isAccompanied: isAccompaniedAsBoolean,
    hasDualControlCar: hasDualControlCarAsBoolean,
    isModification,
  } = req.body

  const isAccompanied = isAccompaniedAsBoolean === true
  const hasDualControlCar = hasDualControlCarAsBoolean === true

  const loggerContent = {
    request_id: req.request_id,
    section,
    action: 'call-create-reservation',
    candidatId,
  }

  appLogger.info({
    ...loggerContent,
    nomCentre,
    date,
    isAccompanied,
    hasDualControlCar,
    isModification,
  })

  // TODO: GET CENTRE ID BY NAME AND GEODEPT
  if (isMissingPrerequesite(nomCentre, date, isAccompanied, hasDualControlCar)) {
    const msg = []
    if (!nomCentre) msg.push(' du centre')
    if (!date) msg.push(' de la date reservation')
    if (!isAccompanied) msg.push(" d'être accompagné")
    if (!hasDualControlCar) msg.push(" d'avoir un véhicule à double commande")
    const messageList = msg.join(',')
    const success = false
    const message = `Une ou plusieurs informations sont manquantes : ${messageList}`

    appLogger.warn({
      ...loggerContent,
      success,
      description: message,
    })
    return res.status(400).json({
      success,
      message,
    })
  }

  try {
    loggerContent.action = 'get-reservation'
    const previousBookedPlace = await canModifyReservation(candidatId, {
      centre: true,
      candidat: true,
    })

    if (previousBookedPlace) {
      const success = true
      const description = 'Vous avez un réservation en cours. Vous devrez annuler votre réservation pour en réserver un autre.'

      appLogger.warn({
        ...loggerContent,
        success,
        description,
      })

      return res.status(200).json({
        success,
        message: description,
      })
    }

    loggerContent.action = 'valid-reservation'
    const statusCanBookPlace = await validCentreDateReservation(
      candidatId,
      nomCentre,
      date,
    )

    if (statusCanBookPlace) {
      appLogger.warn({
        ...loggerContent,
        statusValidResa: statusCanBookPlace,
      })

      return res.status(400).json({
        success: statusCanBookPlace.success,
        message: statusCanBookPlace.message,
      })
    }

    loggerContent.action = 'create-reservation'
    let reservation
    let reservationMessage
    try {
      reservation = await bookPlace(
        candidatId,
        nomCentre,
        date,
        geoDepartement,
        getStatusWithRecentlyDept(candidatStatus, geoDepartement, homeDepartement, isInRecentlyDept),
      )
    } catch (error) {
      appLogger.error({
        ...loggerContent,
        candidatId,
        error,
        description: error.message,
      })
      reservationMessage = error.message
    }

    if (!reservation) {
      const success = false
      const message = reservationMessage || "Il n'y a pas de place pour ce créneau"
      appLogger.warn({
        ...loggerContent,
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
    let dateAfterBook

    const deptCentre = reservation.centre.departement
    if (deptCentre !== reservation.candidat.departement) {
      loggerContent.action = 'update-departement'
      reservation.candidat = await updateCandidatDepartement(
        reservation.candidat,
        deptCentre,
      )
    }

    try {
      loggerContent.action = 'send-convocation'
      await sendMailConvocation(reservation)
      statusmail = true
      message = SAVE_RESA_WITH_MAIL_SENT
    } catch (error) {
      const { nomNaissance, codeNeph } = reservation.candidat
      const { nom, departement } = reservation.centre
      const { date } = reservation
      appLogger.warn({
        ...loggerContent,
        description: `Le courriel de convocation n'a pu être envoyé pour la réservation du candidat ${nomNaissance}/${codeNeph} sur le centre ${nom} du département ${departement} à la date ${date} `,
        error,
      })
      statusmail = false
      message = SAVE_RESA_WITH_NO_MAIL_SENT
    }

    loggerContent.action = 'created-reservation'
    appLogger.info({
      ...loggerContent,
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
      ...loggerContent,
      description: error.message,
      error,
    })
    let errorMessage = "Une erreur est survenue : Impossible de réserver la place. L'administrateur du site a été prévenu"
    let statusCode = 500
    // TODO: Gérer le probleme de duplicate key
    if ((error.code === 509) || (error.code === 11000)) {
      errorMessage = (error.code === 11000)
        ? 'Une erreur est survenue : Impossible de supprimer la place précedente. L\'administrateur du site a été prévenu' : error.message
      statusCode = 509
    }
    res.status(error.status || statusCode).json({
      success: false,
      message: error.status ? error.message : errorMessage,
    })
  }
}

/**
 * Annulation de la réservation par le candidat
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req - Requête
 * @param {string} req.userId - Identifiant du candidat
 * @param {import('express').Response} res - Réponse
 * @see {@link http://localhost:8000/api-docs/#/Candidat/delete_candidat_places| DELETE '/candidat/places'}
 */
export const unbookPlace = async (req, res) => {
  const candidatId = req.userId

  appLogger.info({
    request_id: req.request_id,
    section: 'candidat-remove-reservations',
    action: 'REMOVE_RESA_ARGS',
    candidatId,
  })
  if (!candidatId) {
    const success = false
    const message = USER_INFO_MISSING
    appLogger.warn({
      request_id: req.request_id,
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
        request_id: req.request_id,
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
      request_id: req.request_id,
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
