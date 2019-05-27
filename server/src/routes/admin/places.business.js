import * as csvParser from 'fast-csv'
import { DateTime } from 'luxon'
import {
  addPlaceToArchive,
  setCandidatToVIP,
  findCandidatById,
} from '../../models/candidat'
import {
  findCentreByNameAndDepartement,
  findCentresByDepartement,
} from '../../models/centre/centre.queries'
import {
  findInspecteurByMatricule,
  findInspecteurById,
} from '../../models/inspecteur/inspecteur.queries'
import {
  bookPlaceById,
  createPlace,
  deletePlace,
  findPlaceBookedByCandidat,
  findPlaceById,
  PLACE_ALREADY_IN_DB_ERROR,
  removeBookedPlace,
  findPlaceWithSameWindow,
  findAllPlacesBookedByCentre,
} from '../../models/place'
import { REASON_REMOVE_RESA_ADMIN } from '../../routes/common/reason.constants'
import { appLogger, getDateTimeFrFromJSDate, ErrorWithStatus } from '../../util'
import { sendCancelBookingByAdmin, sendMailConvocation } from '../business'
import {
  BOOKED_PLACE_NO_MAIL,
  CANCEL_BOOKED_PLACE_NO_MAIL,
  CANCEL_BOOKED_PLACE,
  DELETE_PLACE_ERROR,
  RESA_PLACE_HAS_BOOKED,
} from './message.constants'
import {
  sendScheduleInspecteur,
  sendMailForScheduleInspecteurFailed,
} from '../business/send-mail-schedule-inspecteur'

const getPlaceStatus = (
  departement,
  centre,
  inspecteur,
  date,
  status,
  message
) => ({
  departement,
  centre,
  inspecteur,
  date,
  status,
  message,
})

/**
 * TODO:departement a modifier
 * @param {*} data
 */
const transfomCsv = async ({ data, departement }) => {
  const [day, time, matricule, centre, dept] = data

  const myDate = `${day.trim()} ${time.trim()}`

  try {
    const date = DateTime.fromFormat(myDate, 'dd/MM/yy HH:mm', {
      zone: 'Europe/Paris',
      locale: 'fr',
    })

    if (dept !== departement) {
      throw new Error(
        'Le département du centre ne correspond pas au département dont vous avez la charge'
      )
    }

    if (!date.isValid) throw new Error('Date est invalide')
    // TODO: create test unit for search centre by center name and departement
    const foundCentre = await findCentreByNameAndDepartement(
      centre.trim(),
      departement
    )
    if (!foundCentre) {
      throw new Error(`Le centre ${centre.trim()} est inconnu`)
    }

    const inspecteurFound = await findInspecteurByMatricule(matricule.trim())
    if (!inspecteurFound) {
      throw new Error(`L'inspecteur ${matricule.trim()} est inconnu`)
    }

    return {
      departement,
      centre: foundCentre,
      inspecteur: inspecteurFound._id,
      date,
    }
  } catch (error) {
    appLogger.error({
      section: 'admimImportPlaces',
      action: 'transformCsv',
      error,
    })
    return getPlaceStatus(
      departement,
      centre,
      matricule,
      myDate,
      'error',
      error.message
    )
  }
}

const createPlaceCsv = async place => {
  const { centre, inspecteur, date } = place
  try {
    const leanPlace = { inspecteur, date, centre: centre._id }
    await createPlace(leanPlace)
    appLogger.info({
      section: 'Admim-ImportPlaces',
      action: 'createPlaceCsv',
      message: `Place {${centre.departement},${
        centre.nom
      }, ${inspecteur}, ${date}} enregistrée en base`,
    })
    return getPlaceStatus(
      centre.departement,
      centre.nom,
      leanPlace.inspecteur,
      date,
      'success',
      `Place enregistrée en base`
    )
  } catch (error) {
    appLogger.error(JSON.stringify(error))
    if (error.message === PLACE_ALREADY_IN_DB_ERROR) {
      appLogger.warn({
        section: 'Admim-ImportPlaces',
        action: 'createPlaceCsv',
        message: 'Place déjà enregistrée en base',
      })
      return getPlaceStatus(
        centre.departement,
        centre.nom,
        inspecteur,
        date,
        'error',
        'Place déjà enregistrée en base'
      )
    }
    return getPlaceStatus(
      centre.departement,
      centre.nom,
      inspecteur,
      date,
      'error',
      error.message
    )
  }
}

export const importPlacesCsv = async ({ csvFile, departement }) => {
  let PlacesPromise = []

  if (!departement) {
    throw new Error('DEPARTEMENT_IS_MANDATORY')
  }

  return new Promise((resolve, reject) =>
    csvParser
      .fromString(csvFile.data.toString(), { headers: true, ignoreEmpty: true })
      .transform((data, next) => {
        try {
          if (data[0] === 'Date') next()
          else {
            transfomCsv({ data, departement }).then(result => {
              appLogger.debug('transfomCsv' + result)
              if (result.status && result.status === 'error') {
                PlacesPromise.push(result)
                next()
              } else {
                next(null, result)
              }
            })
          }
        } catch (error) {
          appLogger.error(JSON.stringify(error))
        }
      })
      .on('data', place => {
        PlacesPromise.push(createPlaceCsv(place))
      })
      .on('end', () => {
        resolve(Promise.all(PlacesPromise))
      })
  )
}

export const releaseResa = async ({ _id }) => {
  const place = await findPlaceBookedByCandidat(_id)
  if (place) {
    appLogger.info({
      section: 'admin',
      action: 'releaseResa',
      candidat: _id,
      place,
    })
    return removeBookedPlace(place)
  }
}

export const removeReservationPlaceByAdmin = async (place, candidat, admin) => {
  // Annuler la place
  const placeUpdated = await removeBookedPlace(place)
  // Archive place
  let candidatUpdated = addPlaceToArchive(
    candidat,
    place,
    REASON_REMOVE_RESA_ADMIN,
    admin.email
  )
  candidatUpdated = await setCandidatToVIP(candidatUpdated, place.date)

  let statusmail = true
  let message = CANCEL_BOOKED_PLACE
  try {
    await sendCancelBookingByAdmin(placeUpdated, candidatUpdated)
  } catch (error) {
    appLogger.warn({
      section: 'candidat-removeReservations',
      action: 'FAILED_SEND_MAIL',
      error,
    })
    statusmail = false
    message = CANCEL_BOOKED_PLACE_NO_MAIL
  }

  try {
    await deletePlace(placeUpdated)
  } catch (error) {
    appLogger.warn({
      section: 'admin-removePlace',
      action: 'FAILED_DELETE_PLACE',
      error,
    })
    message = DELETE_PLACE_ERROR
  }

  return { statusmail, message, candidat: candidatUpdated, placeUpdated }
}

export const createPlaceForInspector = async (centre, inspecteur, date) => {
  const myDate = date
  try {
    const formatedDate = DateTime.fromFormat(myDate, 'dd/MM/yy HH:mm', {
      zone: 'Europe/Paris',
      locale: 'fr',
    })
    const leanPlace = { inspecteur, date: formatedDate, centre: centre._id }
    await createPlace(leanPlace)
    appLogger.info({
      section: 'Admim-BuisnessPlaces',
      action: 'createPlaceForInspector',
      message: `Place {${centre.departement}, ${
        centre.nom
      }, ${inspecteur}, ${myDate}} enregistrée en base`,
    })
    return getPlaceStatus(
      centre.departement,
      centre.nom,
      inspecteur,
      myDate,
      'success',
      `Place enregistrée en base`
    )
  } catch (error) {
    appLogger.error(JSON.stringify(error))
    if (error.message === PLACE_ALREADY_IN_DB_ERROR) {
      appLogger.warn({
        section: 'Admim-BuisnessPlaces',
        action: 'createPlaceForInspector',
        message: 'Place déjà enregistrée en base',
      })
      return getPlaceStatus(
        centre.departement,
        centre.nom,
        inspecteur,
        myDate,
        'error',
        'Place déjà enregistrée en base'
      )
    }
    return getPlaceStatus(
      centre.departement,
      centre.nom,
      inspecteur,
      date,
      'error',
      error.message
    )
  }
}

export const validUpdateResaInspector = async (resaId, inspecteur) => {
  const resa = await findPlaceById(resaId)
  if (!resa) {
    throw new ErrorWithStatus(404, 'Réservation non trouvée')
  }
  const { centre, date, candidat } = resa

  if (!candidat) {
    throw new ErrorWithStatus(400, "Cette réservation n'a pas de candidat")
  }

  const place = await findPlaceWithSameWindow({
    inspecteur,
    centre,
    date,
  })

  if (!place) {
    throw new ErrorWithStatus(404, 'Réservation non trouvée')
  }
  if (place.candidat) {
    throw new ErrorWithStatus(400, RESA_PLACE_HAS_BOOKED)
  }

  return { resa, place }
}

export const moveCandidatInPlaces = async (resa, place) => {
  const placeId = place._id
  const { _id: resaId, candidat } = resa
  const loggerContent = {
    section: 'admin-move-candidat-in-places',
    resaId,
    placeId,
  }

  appLogger.info({
    ...loggerContent,
    action: 'BOOK_RESA',
    placeId,
    candidat,
  })

  const newResa = await bookPlaceById(placeId, candidat)
  if (!newResa) {
    throw new ErrorWithStatus(400, 'Cette place posséde une réservation')
  }

  appLogger.info({
    ...loggerContent,
    action: 'DELETE_RESA',
    resaId,
  })
  await deletePlace(resa)

  return newResa
}

export const assignCandidatInPlace = async (candidatId, placeId) => {
  const loggerContent = {
    section: 'admin-assign-candidat-in-places',
    candidatId,
    placeId,
  }

  appLogger.info({
    ...loggerContent,
    action: 'BOOK_PLACE',
  })

  const candidat = await findCandidatById(candidatId)
  const place = await findPlaceById(placeId)

  if (!candidat || !place) {
    throw new ErrorWithStatus(422, 'Les paramètres renseignés sont incorrects')
  }
  if ('isValidatedByAurige' in candidat && !candidat.isValidatedByAurige) {
    throw new ErrorWithStatus(400, "Le candidat n'est pas validé par Aurige")
  }

  if (
    getDateTimeFrFromJSDate(candidat.dateReussiteETG).plus({ year: 5 }) <
    getDateTimeFrFromJSDate(place.date)
  ) {
    throw new ErrorWithStatus(
      400,
      'Date ETG ne sera plus valide pour cette place'
    )
  }

  const placeAlreadyBookedByCandidat = await findPlaceBookedByCandidat(
    candidatId
  )
  const newBookedPlace = await bookPlaceById(placeId, candidatId)

  if (!newBookedPlace) {
    throw new ErrorWithStatus(400, 'Cette place est déja réservée')
  }

  if (placeAlreadyBookedByCandidat) {
    await removeBookedPlace(placeAlreadyBookedByCandidat)
  }

  let statusmail
  let message
  try {
    await sendMailConvocation(newBookedPlace)
    statusmail = true
  } catch (error) {
    appLogger.warn({
      section: 'admin-assignCandidatInPlace',
      action: 'FAILED_SEND_MAIL',
      error,
    })
    statusmail = false
    message = BOOKED_PLACE_NO_MAIL
  }
  return {
    newBookedPlace,
    candidat,
    statusmail: {
      status: statusmail,
      message,
    },
  }
}

export const sendMailSchedulesInspecteurs = async (
  email,
  departement,
  date
) => {
  const loggerContent = {
    section: 'admin-send-mail-schedule-inspecteurs',
    departement,
    date,
    email,
  }

  appLogger.debug({
    ...loggerContent,
    func: 'sendMailSchedulesInspecteurs',
  })

  const centres = await findCentresByDepartement(departement)
  const beginDate = DateTime.fromISO(date, {
    locale: 'fr',
    zone: 'Europe/Paris',
  }).startOf('day')
  const endDate = DateTime.fromISO(date, {
    locale: 'fr',
    zone: 'Europe/Paris',
  }).endOf('day')

  const placesByInspecteurs = {}

  await Promise.all(
    centres.map(async centre => {
      const places = await findAllPlacesBookedByCentre(
        centre._id,
        beginDate,
        endDate
      )
      places.forEach(place => {
        if (!placesByInspecteurs[place.inspecteur]) {
          placesByInspecteurs[place.inspecteur] = []
        }
        placesByInspecteurs[place.inspecteur].push(place)
      })
    })
  )

  let results = []
  await Promise.all(
    Object.entries(placesByInspecteurs).map(async entry => {
      try {
        const places = entry[1]
        await sendScheduleInspecteur(email, places)
        return { success: true }
      } catch (error) {
        appLogger.error({ ...loggerContent, message: error.message })
        const inspecteur = await findInspecteurById(entry[0])
        results.push(inspecteur)
        //   return { success: false, inspecteur }
      }
    })
  )
  if (results.length) {
    try {
      await sendMailForScheduleInspecteurFailed(
        email,
        date,
        departement,
        results
      )
    } catch (error) {
      appLogger.error({ ...loggerContent, message: error.message })
    }
    return { success: false, inspecteurs: results }
  }
  return { success: true }
}
