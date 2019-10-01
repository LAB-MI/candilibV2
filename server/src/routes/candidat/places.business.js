/**
 * Module regroupant la logique métier concernant les actions possibles sur le candidat sur les places
 *
 * @module routes/candidat/places-business
 */

import config from '../../config'
import {
  appLogger,
  techLogger,
  getFrenchFormattedDateTime,
  getFrenchLuxon,
  getFrenchLuxonFromISO,
  getFrenchLuxonFromJSDate,
} from '../../util'
import {
  findAvailablePlacesByCentre,
  findPlacesByCentreAndDate,
  findPlaceBookedByCandidat,
  findAndbookPlace,
  removeBookedPlace,
} from '../../models/place'
import {
  findCentreByName,
  findCentreByNameAndDepartement,
} from '../../models/centre'
import {
  CANCEL_RESA_WITH_MAIL_SENT,
  CANCEL_RESA_WITH_NO_MAIL_SENT,
  SAME_RESA_ASKED,
  USER_INFO_MISSING,
  CANDIDAT_NOT_FOUND,
  CAN_BOOK_AFTER,
} from './message.constants'
import { sendCancelBooking } from '../business'
import { getAuthorizedDateToBook } from './authorize.business'
import {
  updateCandidatCanBookFrom,
  findCandidatById,
  archivePlace,
} from '../../models/candidat'
import { REASON_CANCEL, REASON_MODIFY } from '../common/reason.constants'

/**
 * Renvoie tous les créneaux d'un centre
 * @async
 * @function
 *
 * @param {string} id identifiant du centre
 * @param {string} endDate Date maximale au format ISO pour laquelle il faut retourner les places
 *
 * @returns {string[]} Tableau de dates au format ISO
 */
export const getDatesByCentreId = async (_id, endDate) => {
  appLogger.debug({
    func: 'getDatesByCentreId',
    _id,
    endDate,
  })

  const beginDate = getAuthorizedDateToBook()
  const endDateTime = getFrenchLuxonFromISO(endDate)

  endDate = !endDateTime.invalid ? endDateTime.toJSDate() : undefined

  const places = await findAvailablePlacesByCentre(_id, beginDate, endDate)
  const dates = places.map(place =>
    getFrenchLuxonFromJSDate(place.date).toISO()
  )
  return [...new Set(dates)]
}

/**
 * Renvoie tous les créneaux (disponibles ou non) d'un centre dans une fourchette de temps
 * @async
 * @function
 *
 * @param {string} departement Code du département
 * @param {string} centre Nom du centre
 * @param {string} beginDate Date au format ISO à partir duquel des places correspondantes doivent être retournées
 * @param {string} endDate Date au format ISO
 *
 * @returns {string[]} Tableau de dates au format ISO
 */
export const getDatesByCentre = async (
  departement,
  nomCentre,
  beginDate,
  endDate
) => {
  appLogger.debug({
    func: 'getDatesByCentre',
    departement,
    nomCentre,
    beginDate,
    endDate,
  })

  let foundCentre
  if (departement) {
    foundCentre = await findCentreByNameAndDepartement(nomCentre, departement)
  } else {
    foundCentre = await findCentreByName(nomCentre)
  }
  const dates = await getDatesByCentreId(foundCentre._id, beginDate, endDate)
  return dates
}

/**
 * Retournes les places pour un créneau (centre et date)
 * @async
 * @function
 *
 * @param {string} id Id du centre
 * @param {object} date Date en Objet natif JS Date
 *
 * @returns {string[]} Tableau de dates au format ISO
 */
export const hasAvailablePlaces = async (id, date) => {
  const places = await findPlacesByCentreAndDate(id, date)
  const dates = places.map(place =>
    getFrenchLuxonFromJSDate(place.date).toISO()
  )
  return [...new Set(dates)]
}

/**
 * Renvoie tous les créneaux disponibles d'un centre pour un jour donné
 * @async
 * @function
 *
 * @param {string} departement Code du département du centre
 * @param {string} nomCentre Nom du centre
 * @param {object} date Date en Objet natif JS Date
 *
 * @returns {string[]} Tableau de dates au format ISO
 */
export const hasAvailablePlacesByCentre = async (
  departement,
  nomCentre,
  date
) => {
  const foundCentre = await findCentreByNameAndDepartement(
    nomCentre,
    departement
  )
  const dates = await hasAvailablePlaces(foundCentre._id, date)
  return dates
}

/**
 * Récupère la réservation d'un candidat
 * @async
 * @function
 *
 * @param {string} candidatId Id du candidat
 * @param {object} options Options à passer à MongoDB pour la query
 *
 * @returns {object} Place réservée par le candidat
 */
export const getReservationByCandidat = async (candidatId, options) => {
  const place = await findPlaceBookedByCandidat(
    candidatId,
    {},
    options || { centre: true }
  )
  return place
}

/**
 * Associe un candidat à une place à partir d'un créneau (date et centre)
 * @async
 * @function
 *
 * @param {string} candidatId Id du candidat
 * @param {string} centre Id du centre
 * @param {object} options Options à passer à MongoDB pour la requête
 *
 * @returns {object} Place réservée par le candidat
 */
export const bookPlace = async (candidatId, centre, date) => {
  const bookedAt = getFrenchLuxon().toJSDate()
  const place = await findAndbookPlace(
    candidatId,
    centre,
    date,
    bookedAt,
    { inspecteur: 0 },
    { centre: true, candidat: true }
  )

  return place
}

/**
 * @typedef {Object} RemoveReservationReturn
 * @property {string} statusmail - État (succès ou échec) de l'envoi du mail
 * @property {string} message - Message à afficher à l'utilisateur
 * @property {string} dateAfterBook - Date en format ISO
 */

/**
 * Supprime sur une place, l'association avec un candidat
 * @async
 * @function
 *
 * @param {string} bookedPlace Id du candidat
 * @param {boolean} isModified Booléen à `true` s'il s'agit d'une modification, à `false` ou `undefined` s'il s'agit d'une annulation
 *
 * @returns {RemoveReservationReturn} Informations à afficher au client
 */
export const removeReservationPlace = async (bookedPlace, isModified) => {
  const candidat = bookedPlace.candidat
  if (!candidat) {
    throw new Error("Il n'y pas de candidat pour annuler la reservation")
  }
  const { _id: candidatId } = candidat

  let dateAfterBook
  const datetimeAfterBook = await applyCancelRules(candidat, bookedPlace.date)
  await removeBookedPlace(bookedPlace)
  await archivePlace(
    candidat,
    bookedPlace,
    isModified ? REASON_MODIFY : REASON_CANCEL
  )

  let statusmail = true
  let message = CANCEL_RESA_WITH_MAIL_SENT

  if (datetimeAfterBook) {
    if (isModified) {
      message =
        CAN_BOOK_AFTER + getFrenchFormattedDateTime(datetimeAfterBook).date
    } else {
      message =
        message +
        ' ' +
        CAN_BOOK_AFTER +
        getFrenchFormattedDateTime(datetimeAfterBook).date
    }
    dateAfterBook = datetimeAfterBook.toISODate()
  }

  try {
    await sendCancelBooking(candidat, bookedPlace)

    appLogger.info({
      section: 'candidat-removeReservation',
      candidatId,
      success: true,
      statusmail,
      description: message,
      placeId: bookedPlace._id,
    })
  } catch (error) {
    techLogger.error({
      section: 'candidat-removeReservation',
      action: 'FAILED_SEND_MAIL',
      description: error.message,
      error,
    })
    statusmail = false
    message = CANCEL_RESA_WITH_NO_MAIL_SENT
  }

  return {
    statusmail,
    message,
    dateAfterBook,
  }
}

/**
 * Détermine si une réservation est dans le même créneau (même date/heure et même centre)
 * @function
 *
 * @param {string} centerId Type string from ObjectId of mongoose
 * @param {DateTime} date Type DateTime from luxon
 * @param {object} previewBookedPlace Type model place which populate centre and candidat
 *
 * @returns {boolean} Indique s'il s'agit du même créneau (même centre et même date et heure)
 */
export const isSameReservationPlace = (centerId, date, previewBookedPlace) => {
  if (centerId === previewBookedPlace.centre._id.toString()) {
    const diffDateTime = date.diff(
      getFrenchLuxonFromJSDate(previewBookedPlace.date),
      'second'
    )
    if (diffDateTime.seconds === 0) {
      return true
    }
  }
  return false
}

/**
 * Détermine si un candidat peut annuler sa réservation
 * @function
 *
 * @param {DateTime} previewDateReservation Type DateTime luxon
 *
 * @returns {boolean} Est à `true` si le candidat peut supprimer cette réservation `false` sinon
 */
export const canCancelReservation = previewDateReservation => {
  const dateCancelAutorize = getFrenchLuxon().plus({
    days: config.daysForbidCancel,
  })
  return previewDateReservation.diff(dateCancelAutorize, 'days') > 0
}

/**
 * Retourne la date à partir de laquelle l'utilisateur peut réserver une place
 * @function
 *
 * @param {object} candidat type Candidate Model
 * @param {Date} previewDateReservation Type Date javascript
 *
 * @returns {DateTime}
 */
export const applyCancelRules = async (candidat, previewDateReservation) => {
  const previewBookedPlace = getFrenchLuxonFromJSDate(previewDateReservation)

  if (canCancelReservation(previewBookedPlace)) {
    return
  }

  const canBookFromDate = getCandBookFrom(candidat, previewBookedPlace)

  await updateCandidatCanBookFrom(candidat, canBookFromDate)

  return canBookFromDate
}

/**
 * Récupère la première date à laquelle le candidat peut réserver une place après une non-réussite à l'examen
 *
 * @function
 *
 * @param {object} candidat
 * @param {DateTime} datePassage
 *
 * @returns {DateTime} La date à partir de laquelle le candidat peut prendre un place
 */
export const getCandBookFrom = (candidat, datePassage) => {
  if (!datePassage) {
    throw new Error('Il manque la date de passage')
  }

  if (!candidat) {
    throw new Error('Il manque le candidat')
  }

  const daysOfDatePassage = datePassage.endOf('days')
  const newCanBookFrom = daysOfDatePassage.plus({
    days: config.timeoutToRetry,
  })

  const { canBookFrom } = candidat
  const previewCanBookFrom = canBookFrom
    ? getFrenchLuxonFromJSDate(canBookFrom)
    : undefined

  if (
    previewCanBookFrom &&
    previewCanBookFrom.isValid &&
    previewCanBookFrom.diff(newCanBookFrom, 'days') > 0
  ) {
    return previewCanBookFrom
  }
  return newCanBookFrom
}

/**
 * Récupère la première date à laquelle le candidat peut réserver une place (Les places avant cette date ne doivent pas lui être présentées)
 *
 * @function
 *
 * @param {object} candidat
 * @param {DateTime} datePassage
 *
 * @returns {DateTime} La date à partir de laquelle le candidat peut prendre un place
 */

export const getBeginDateAuthorize = candidat => {
  let beginDateAutoriseDefault
  if (config.delayToBook) {
    beginDateAutoriseDefault = getFrenchLuxon()
      .endOf('day')
      .plus({
        days: config.delayToBook,
      })
  } else {
    beginDateAutoriseDefault = getFrenchLuxon()
  }

  const dateCanBookFrom = getFrenchLuxonFromJSDate(candidat.canBookFrom)

  if (!!candidat.canBookFrom && dateCanBookFrom.isValid) {
    const { days } = dateCanBookFrom.diff(beginDateAutoriseDefault, ['days'])
    if (days > 0) {
      return dateCanBookFrom
    }
  }

  return beginDateAutoriseDefault
}

/**
 * Renvoie la date à partir de laquelle le candidat encourrera une pénalité s'il modifie ou annule sa place
 * @function
 *
 * @param {JSDate} dateReservation Date de l'examen de la place
 *
 * @returns {string} Date limite en ISO avant laquelle le candidat peut modifier ou annuler sa place sans encourir de pénalité
 */
export const getLastDateToCancel = dateReservation => {
  const dateTimeResa = getFrenchLuxonFromJSDate(dateReservation)
  return dateTimeResa.minus({ days: config.daysForbidCancel }).toISODate()
}

/**
 * Ajoute les informations du candidat pour sa réservation
 * @function
 *
 * @param {string} candidatId Identifiant de l'utilisateur
 * @param {object} reservation Place réservée par un candidat
 *
 * @returns {object} La réservation avec
 */
export const addInfoDateToRulesResa = async (candidatId, reservation) => {
  const {
    timeoutToRetry: timeOutToRetry,
    daysForbidCancel: dayToForbidCancel,
  } = config

  const candidat = await findCandidatById(candidatId, {
    canBookFrom: 1,
    dateDernierEchecPratique: 1,
  })
  const { canBookFrom, dateDernierEchecPratique } = candidat

  return {
    ...reservation,
    dateDernierEchecPratique,
    canBookFrom,
    timeOutToRetry,
    dayToForbidCancel,
  }
}
/**
 * @async
 * @function validCentreDateReservation
 *
 * @param {string} candidatId Id de mongoose
 * @param {string} centre Id of mongoose
 * @param {Date|DateTime} date Date de l'examen de la place réservée
 * @param {object} previewBookedPlace Type model place which populate centre and candidat
 *
 * @returns {Promise<InfoObject>}

 */
export const validCentreDateReservation = async (
  candidatId,
  centreId,
  date,
  previewBookedPlace
) => {
  let candidat
  const dateTimeResa = getFrenchLuxonFromISO(date)
  if (previewBookedPlace) {
    const isSame = isSameReservationPlace(
      centreId,
      dateTimeResa,
      previewBookedPlace
    )

    if (isSame) {
      const success = false
      const message = SAME_RESA_ASKED
      appLogger.warn({
        section: 'candidat-valid-centre-date-reservation',
        candidatId,
        success,
        description: message,
      })
      return {
        success,
        message,
      }
    }
    candidat = previewBookedPlace.candidat
  }

  if (!candidat) {
    if (!candidatId) {
      throw new Error(USER_INFO_MISSING)
    }

    candidat = await findCandidatById(candidatId, {})
    if (!candidat) {
      throw new Error(CANDIDAT_NOT_FOUND)
    }
  }

  let dateAuthorize = getBeginDateAuthorize(candidat)
  const { days } = dateAuthorize.diff(dateTimeResa, ['days'])
  let isAuthorize = days < 0

  if (previewBookedPlace && isAuthorize) {
    const datePreview = getFrenchLuxonFromJSDate(previewBookedPlace.date)
    if (!canCancelReservation(datePreview)) {
      dateAuthorize = getCandBookFrom(candidat, datePreview)
      isAuthorize = dateTimeResa > dateAuthorize
    }
  }

  if (!isAuthorize) {
    const success = false
    const message =
      CAN_BOOK_AFTER + getFrenchFormattedDateTime(dateAuthorize).date
    appLogger.warn({
      section: 'candidat-valid-centre-date-reservation',
      candidatId,
      success,
      description: message,
    })
    return {
      success,
      message,
    }
  }
}

/**
 * @typedef {Object} DateTime
 *
 * DateTime object from luxon {@link https://moment.github.io/luxon/docs/}
 */

/**
 * @typedef {Object} Candidat
 *
 * @property {string} nomNaissance         - Nom de naissance du candidat
 */

/**
 * @typedef {Object} Candidat
 *
 * @property {string} nomNaissance         - Nom de naissance du candidat
 * @property {string} prenom               - Prénom du candidat
 * @property {string} codeNeph             - NEPH du candidat
 * @property {string} departement          - Département des centres à afficher au candidat
 * @property {Date} [dateReussiteETG]      - Date de la dernière réussite à l'ETG
 * @property {Date} [reussitePratique]     - Date de la réussite pratique
 * @property {string} email                - Adresse courriel du candidat
 * @property {string} portable             - Numéro de télephone mobile du candidat
 * @property {string} adresse              - Adresse postale du candidat
 * @property {boolean} isValidatedByAurige - Informe sur le résultat de la synchro Aurige (`null` : pas encore synchro, `false` : non validé, `true` : validé)
 * @property {Date} presignedUpAt          - Date à laquelle le candidat a rempli et envoyé le formulaire de pré-inscription
 * @property {boolean} isValidatedEmail    - Numéro de télephone mobile du candidat
 * @property {string} emailValidationHash  - UUID de validation de l'adresse courriel du candidat
 * @property {Date} [emailValidatedAt]     - Date à laquelle le candidat a validé son adresse courriel
 * @property {Date} [aurigeValidatedAt]    - Date à laquelle le candidat a été validé par Aurige
 * @property {Date} [canBookFrom]          - Date minimale des places visibles par le candidat
 * @property {boolean} [isEvaluationDone]  - Informe sur le fait que le candidat a envoyé un questionnaire de satisfaction ou non
 * @property {ArchivedPlace[]} [places]    - Liste des places que le candidat a réservé
 * @property {number} [nbEchecsPratiques]  - Nombre d'échecs du candidat à l'examen pratique
 * @property {NoReussite} [noReussites]    - Liste des non-réussites du candidat à l'examen pratique
 * @property {Date} [firstConnection]      - Date à laquelle le candidat s'est connecté la première fois
 */

/**
 * @typedef {Object} InfoObject
 *
 * @property {boolean} success - Indique si l'action a été effectuée avec succès
 * @property {string} message  - Message destiné à être affiché à l'utilisateur : message de réussite de l'action
 *                              ou message d'erreur compréhensible par un non technicien
 */
