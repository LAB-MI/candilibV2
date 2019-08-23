import * as csvParser from 'fast-csv'
import XlsxStreamReader from 'xlsx-stream-reader'
import streamBuffers from 'stream-buffers'

import { DateTime } from 'luxon'
import {
  addPlaceToArchive,
  findCandidatById,
  setCandidatToVIP,
  archivePlace,
} from '../../models/candidat'
import {
  findCentreByNameAndDepartement,
  findCentresByDepartement,
} from '../../models/centre/centre.queries'
import {
  findAllInspecteurs,
  findInspecteurById,
  findInspecteurByMatricule,
} from '../../models/inspecteur/inspecteur.queries'
import {
  bookPlaceById,
  createPlace,
  deletePlace,
  findAllPlacesBookedByCentre,
  findPlaceBookedByCandidat,
  findPlaceBookedByInspecteur,
  findPlaceById,
  findPlaceWithSameWindow,
  PLACE_ALREADY_IN_DB_ERROR,
  removeBookedPlace,
} from '../../models/place'
import {
  REASON_REMOVE_RESA_ADMIN,
  REASON_MODIFY_RESA_ADMIN,
} from '../../routes/common/reason.constants'
import {
  appLogger,
  ErrorWithStatus,
  getFrenchLuxonFromJSDate,
  getFrenchLuxonRangeFromDate,
  FRENCH_LOCALE_INFO,
} from '../../util'
import { sendCancelBookingByAdmin, sendMailConvocation } from '../business'
import {
  sendMailForScheduleInspecteurFailed,
  sendScheduleInspecteur,
} from '../business/send-mail-schedule-inspecteur'
import {
  BOOKED_PLACE_NO_MAIL,
  CANCEL_BOOKED_PLACE,
  CANCEL_BOOKED_PLACE_NO_MAIL,
  DELETE_PLACE_ERROR,
  PLACE_IS_ALREADY_BOOKED,
} from './message.constants'

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
const parseRow = async ({ data, departement }) => {
  const loggerInfo = {
    section: 'admimImportPlaces',
    action: 'parseRow',
    data,
    departement,
  }
  let myCentre
  let myMatricule
  let myDate

  try {
    const [day, time, matricule, nom, centre, dept] = data

    myCentre = centre.trim()
    myMatricule = matricule.trim()

    myDate = `${day.trim()} ${time.trim()}`

    if (
      !day.trim() ||
      !time.trim() ||
      !matricule.trim() ||
      !nom.trim() ||
      !centre.trim() ||
      !dept.trim()
    ) {
      throw new Error(
        `Une ou plusieurs information(s) manquante(s) dans le fichier CSV.
        [
          date: ${day.trim()},
          heur: ${time.trim()},
          matricule: ${matricule.trim()},
          nom: ${nom.trim()},
          centre: ${centre.trim()},
          departement: ${dept.trim()}
        ]`
      )
    }

    const date = DateTime.fromFormat(
      myDate,
      'dd/MM/yy HH:mm',
      FRENCH_LOCALE_INFO
    )

    if (dept.trim() !== departement) {
      throw new Error(
        `Le département du centre (${dept.trim()}) ne correspond pas au département dont vous avez la charge (${departement})`
      )
    }

    if (!date.isValid) {
      throw new Error('Date est invalide')
    }

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

    if (inspecteurFound.nom.toUpperCase() !== nom.trim().toUpperCase()) {
      throw new Error(
        `Le nom "${nom.trim()}" de l'inspecteur ne correspond pas au matricule "${matricule.trim()}"`
      )
    }

    return {
      departement,
      centre: foundCentre,
      inspecteur: inspecteurFound._id,
      date,
    }
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      error,
    })
    return getPlaceStatus(
      departement,
      myCentre,
      myMatricule,
      myDate,
      'error',
      error.message
    )
  }
}

const createPlaceFromFile = async place => {
  const loggerInfo = {
    func: 'createPlaceFromFile',
  }
  const { centre, inspecteur, date } = place
  try {
    const leanPlace = { inspecteur, date, centre: centre._id }
    await createPlace(leanPlace)
    appLogger.info({
      ...loggerInfo,
      description: `Place {${centre.departement},${centre.nom}, ${inspecteur}, ${date}} enregistrée en base`,
    })
    return getPlaceStatus(
      centre.departement,
      centre.nom,
      leanPlace.inspecteur,
      date,
      'success',
      'Place enregistrée en base'
    )
  } catch (error) {
    loggerInfo.place = { centre, inspecteur, date }
    appLogger.error({ ...loggerInfo, error })
    if (error.message === PLACE_ALREADY_IN_DB_ERROR) {
      appLogger.warn({
        ...loggerInfo,
        description: 'Place déjà enregistrée en base',
        error,
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
  const loggerInfo = {
    func: 'importPlacesCsv',
  }
  const PlacesPromise = []

  if (!departement) {
    throw new Error('DEPARTEMENT_IS_MANDATORY')
  }

  return new Promise((resolve, reject) =>
    csvParser
      .fromString(csvFile.data.toString(), {
        headers: false,
        ignoreEmpty: true,
      })
      .transform((data, next) => {
        try {
          if (data[0] === 'Date') next()
          else {
            parseRow({ data, departement }).then(result => {
              appLogger.debug({
                ...loggerInfo,
                action: 'resolve-transformCsv',
                result,
              })
              if (result.status && result.status === 'error') {
                PlacesPromise.push(result)
                next()
              } else {
                next(null, result)
              }
            })
          }
        } catch (error) {
          appLogger.error({
            ...loggerInfo,
            action: 'csv-parser-transform',
            error,
          })
        }
      })
      .on('data', place => {
        PlacesPromise.push(createPlaceFromFile(place))
      })
      .on('end', () => {
        resolve(Promise.all(PlacesPromise))
      })
  )
}

export const importPlacesXlsx = async ({ xlsxFile, departement }) => {
  const placesPromise = []
  return new Promise((resolve, reject) => {
    const workBookReader = new XlsxStreamReader()
    workBookReader.on('error', function (error) {
      reject(error)
    })
    workBookReader.on('worksheet', function (workSheetReader) {
      if (workSheetReader.id > 1) {
        // we only want first sheet
        workSheetReader.skip()
        return
      }

      workSheetReader.on('row', function (row) {
        if (row.attributes.r !== '1' && !row.values.includes('Date')) {
          const data = row.values.filter(() => true) // Remove empty slots from array
          const placePromise = parseRow({ data, departement })
          placesPromise.push(placePromise)
        }
      })

      workSheetReader.process()
    })

    workBookReader.on('end', async function () {
      const places = await Promise.all(placesPromise)
      const placesInDb = await Promise.all(
        places.map(place => {
          if (place.status === 'error') {
            return place
          }
          return createPlaceFromFile(place)
        })
      )
      resolve(placesInDb)
    })

    const myReadableStreamBuffer = new streamBuffers.ReadableStreamBuffer({
      chunkSize: 2048,
    })

    myReadableStreamBuffer.put(xlsxFile.data)
    myReadableStreamBuffer.pipe(workBookReader)
  })
}

export const importPlacesFromFile = async ({ planningFile, departement }) => {
  if (planningFile.name.endsWith('.csv')) {
    return importPlacesCsv({ csvFile: planningFile, departement })
  }
  if (planningFile.name.endsWith('.xlsx')) {
    return importPlacesXlsx({ xlsxFile: planningFile, departement })
  }
  throw new Error(`Format du fichier inattendu (${planningFile.name})`)
}

export const releaseResa = async ({ _id }) => {
  const loggerInfo = {
    func: 'releaseResa',
    candidat: _id,
  }
  appLogger.debug(loggerInfo)
  const place = await findPlaceBookedByCandidat(_id)
  if (place) {
    appLogger.debug({
      func: 'releaseResa',
      acion: 'remove-place',
      candidat: _id,
      place,
    })
    return removeBookedPlace(place)
  }
}

export const removeReservationPlaceByAdmin = async (place, candidat, admin) => {
  const loggerInfo = {
    func: 'removeReservationPlaceByAdmin',
    place,
    candidat,
    admin,
  }
  appLogger.debug(loggerInfo)

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
      ...loggerInfo,
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
      ...loggerInfo,
      action: 'FAILED_DELETE_PLACE',
      error,
    })
    message = DELETE_PLACE_ERROR
  }

  return { statusmail, message, candidat: candidatUpdated, placeUpdated }
}

export const createPlaceForInspector = async (centre, inspecteur, date) => {
  const loggerInfo = {
    func: 'createPlaceForInspector',
    centre,
    inspecteur,
    date,
  }
  appLogger.debug(loggerInfo)

  const myDate = date
  try {
    loggerInfo.action = 'createPlaceForInspector'

    const formatedDate = DateTime.fromFormat(myDate, 'dd/MM/yy HH:mm', {
      zone: 'Europe/Paris',
      locale: 'fr',
    })
    const leanPlace = { inspecteur, date: formatedDate, centre: centre._id }
    await createPlace(leanPlace)
    appLogger.info({
      ...loggerInfo,
      description: `Place {${centre.departement}, ${centre.nom}, ${inspecteur}, ${myDate}} enregistrée en base`,
    })
    return getPlaceStatus(
      centre.departement,
      centre.nom,
      inspecteur,
      myDate,
      'success',
      'Place enregistrée en base'
    )
  } catch (error) {
    if (error.message === PLACE_ALREADY_IN_DB_ERROR) {
      appLogger.warn({
        ...loggerInfo,
        description: 'Place déjà enregistrée en base',
        error,
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
    appLogger.error({
      ...loggerInfo,
      error,
    })
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
    throw new ErrorWithStatus(400, PLACE_IS_ALREADY_BOOKED)
  }

  return { resa, place }
}

export const moveCandidatInPlaces = async (resa, place) => {
  const placeId = place._id
  const { _id: resaId, candidat } = resa
  const loggerContent = {
    func: 'moveCandidatInPlaces',
    resaId,
    placeId,
  }

  appLogger.debug({
    ...loggerContent,
    action: 'BOOK_RESA',
    placeId,
    candidat,
  })

  const newResa = await bookPlaceById(placeId, candidat)
  if (!newResa) {
    throw new ErrorWithStatus(400, 'Cette place posséde une réservation')
  }

  appLogger.debug({
    ...loggerContent,
    action: 'DELETE_RESA',
    resaId,
  })
  await deletePlace(resa)

  return newResa
}

export const assignCandidatInPlace = async (candidatId, placeId, admin) => {
  const loggerContent = {
    section: 'admin-assign-candidat-in-places',
    candidatId,
    placeId,
    user: admin._id,
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
    getFrenchLuxonFromJSDate(candidat.dateReussiteETG).plus({ year: 5 }) <
    getFrenchLuxonFromJSDate(place.date)
  ) {
    throw new ErrorWithStatus(
      400,
      'Date ETG ne sera plus valide pour cette place'
    )
  }

  const placeAlreadyBookedByCandidat = await findPlaceBookedByCandidat(
    candidatId
  )
  const newBookedPlace = await bookPlaceById(
    placeId,
    candidatId,
    'centre candidat date inspecteur',
    {
      candidat: true,
      centre: true,
    }
  )

  if (!newBookedPlace) {
    throw new ErrorWithStatus(400, PLACE_IS_ALREADY_BOOKED)
  }

  if (placeAlreadyBookedByCandidat) {
    await removeBookedPlace(placeAlreadyBookedByCandidat)
    await archivePlace(
      candidat,
      placeAlreadyBookedByCandidat,
      REASON_MODIFY_RESA_ADMIN,
      admin.email
    )
  }

  let statusmail
  let message
  try {
    await sendMailConvocation(newBookedPlace)
    statusmail = true
  } catch (error) {
    appLogger.warn({
      ...loggerContent,
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
  departementEmail,
  departement,
  date,
  isForInspecteurs
) => {
  const loggerContent = {
    section: 'admin-send-mail-schedule-inspecteurs',
    departement,
    date,
    departementEmail,
  }

  appLogger.debug({
    ...loggerContent,
    func: 'sendMailSchedulesInspecteurs',
  })

  const { begin: beginDate, end: endDate } = getFrenchLuxonRangeFromDate(date)

  const placesByInspecteurs = {}
  const inspecteursEmails = {}
  const centres = await findCentresByDepartement(departement)

  await Promise.all(
    centres.map(async centre => {
      const places = await findAllPlacesBookedByCentre(
        centre._id,
        beginDate,
        endDate
      )
      await Promise.all(
        places.map(async place => {
          const { inspecteur: inspecteurId } = place
          if (!placesByInspecteurs[inspecteurId]) {
            if (isForInspecteurs) {
              const { email: emailInspecteur } = await findInspecteurById(
                inspecteurId
              )
              inspecteursEmails[inspecteurId] = emailInspecteur
            }
            placesByInspecteurs[inspecteurId] = []
          }

          placesByInspecteurs[inspecteurId].push(place)
        })
      )
    })
  )

  const resultsError = []
  await Promise.all(
    Object.entries(placesByInspecteurs).map(async ([inspecteurId, places]) => {
      try {
        await sendScheduleInspecteur(
          isForInspecteurs ? inspecteursEmails[inspecteurId] : departementEmail,
          places
        )
        appLogger.info({
          ...loggerContent,
          inspecteur: inspecteurId,
          nbPlaces: places.length,
          emailTo: isForInspecteurs
            ? inspecteursEmails[inspecteurId]
            : departementEmail,
          emailInspecteur: isForInspecteurs
            ? inspecteursEmails[inspecteurId]
            : null,
          description: 'Bordereau envoyé',
        })
        return { success: true }
      } catch (error) {
        appLogger.error({ ...loggerContent, error, inspecteur: inspecteurId })
        const inspecteur = await findInspecteurById(inspecteurId)
        resultsError.push(inspecteur)
      }
    })
  )

  if (resultsError.length) {
    try {
      await sendMailForScheduleInspecteurFailed(
        departementEmail,
        date,
        departement,
        resultsError
      )
    } catch (error) {
      appLogger.error({ ...loggerContent, error })
    }
    return { success: false, inspecteurs: resultsError }
  }
  return { success: true }
}

export const sendMailSchedulesAllInspecteurs = async date => {
  const loggerContent = {
    func: 'sendMailSchedulesAllInspecteurs',
    date,
  }
  appLogger.debug({
    ...loggerContent,
  })

  const { begin, end } = getFrenchLuxonRangeFromDate(date)

  const inspecteurs = await findAllInspecteurs()

  const resultsAsync = inspecteurs.map(async inspecteur => {
    const { _id, email } = inspecteur
    let nbPlaces = 0
    const places = await findPlaceBookedByInspecteur(_id, begin, end)
    if (places && places.length > 0) {
      nbPlaces = places.length
      try {
        await sendScheduleInspecteur(email, places, inspecteur)
        appLogger.info({
          ...loggerContent,
          inspecteur: _id,
          nbPlaces: places.length,
          email,
          description: 'Bordereau envoyé',
        })
      } catch (error) {
        appLogger.error({ ...loggerContent, inspecteur: _id, error })
        return { success: false, inspecteur }
      }
    }
    appLogger.info({
      ...loggerContent,
      inspecteur: _id,
      nbPlaces: 0,
      email,
      description: 'Pas de réservarion',
    })
    return { success: true, nbPlaces, inspecteur }
  })
  const results = await Promise.all(resultsAsync)
  appLogger.debug({
    ...loggerContent,
    results,
  })

  return results
}
