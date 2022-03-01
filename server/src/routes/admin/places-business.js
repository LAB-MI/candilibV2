/**
 * Module concernant les logiques métiers des actions sur les places par un utilisateur
 * @module
 */
import * as csvParser from 'fast-csv'
import XlsxStreamReader from 'xlsx-stream-reader'
import streamBuffers from 'stream-buffers'

import { DateTime } from 'luxon'
import {
  addPlaceToArchive,
  findCandidatById,
  setCandidatToVIP,
  archivePlace,
  updateCandidatDepartement,
} from '../../models/candidat'
import {
  findCentreByNameAndDepartement,
  findCentresByDepartement,
} from '../../models/centre/centre-queries'
import {
  findAllInspecteurs,
  findInspecteurById,
  findInspecteurByMatricule,
} from '../../models/inspecteur'
import {
  bookPlaceById,
  createPlace,
  deletePlace,
  findAllPlacesBookedByCentreAndInspecteurs,
  findPlaceBookedByCandidat,
  findPlaceBookedByInspecteur,
  findPlaceById,
  findPlaceWithSameWindow,
  PLACE_ALREADY_IN_DB_ERROR,
  removeBookedPlace,
  setBookedPlaceKeyToFalseOrTrue,
} from '../../models/place'
import {
  REASON_REMOVE_RESA_ADMIN,
  REASON_MODIFY_RESA_ADMIN,
} from '../common/reason.constants'
import {
  appLogger,
  ErrorWithStatus,
  getFrenchLuxonFromJSDate,
  getFrenchLuxonRangeFromDate,
  getFrenchLuxon,
  FRENCH_LOCALE_INFO,
  AUTHORIZED_HOURS,
} from '../../util'
import { sendCancelBookingByAdmin, sendMailConvocation, sendMails } from '../business'
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
  UNKNOWN_ERROR_UPLOAD_PLACES,
} from './message.constants'
// TODO: Uncomment next line after 31/12/2020
// import { NB_YEARS_ETG_EXPIRED } from '../common/constants'
import { isETGExpired } from './business'
import { getDateVisibleForPlaces } from '../candidat/util/date-to-display'

/**
 * Résultat d'import d'une place
 * @typedef {Object} PlaceStatus
 * @property {string} departement
 * @property {string} centre
 * @property {string} inspecteur
 * @property {string} date
 * @property {string} status
 * @property {string} message
 */

/**
 * Formatage de la réponse d'une place suite à un import de planning d'inspecteur
 * @function
 *
 * @param {string} departement Département de la place
 * @param {string} centre Centre de la place
 * @param {string} inspecteur Inspecteur de la place
 * @param {string} date Date de la place
 * @param {string} status Etat du traitement de la place
 * @param {string} message Message compréhensible par un utilisateur
 *
 * @return {PlaceStatus}
 */
const getPlaceStatus = (
  departement,
  centre,
  inspecteur,
  date,
  status,
  message,
) => ({
  departement,
  centre,
  inspecteur,
  date,
  status,
  message,
})

/**
 * Une ligne d'un fichier d'import de places
 * @typedef {string[]} RowImportPlace
 * @property {string} 1 La date  en format dd/mm/aa
 * @property {string} 2 L'heure  en format hh:mm
 * @property {string} 3 Le matricule de l'inspecteur
 * @property {string} 4 Le nom de l'inspecteur
 * @property {string} 5 Le nom du centre
 * @property {string} 6 Le département sélectionné
 */
/**
 * @typedef {Object} RowObjectPlace
 * @property {string} departement Département sélectionné
 * @property {import('mongoose').Schema.Types.ObjectId|string} centre Identifiant du centre enregistré dans la base de données
 * @property {import('mongoose').Schema.Types.ObjectId|string} inspecteur Identifiant d'un inspecteur enregistré dans la base de données
 * @property {import('luxon').DateTime} date La date et heure de la place
 */
/**
 * Analyse et Convertit les données d'une ligne du fichier d'import de places
 * - en object [RowObjectPlace]{@link import('./places-business').RowObjectPlace} compréhensiblee pour la fonction createPlaceFromFile
 * - ou en object [PlaceStatus]{@link import('./places-business').PlaceStatus} avec la valeur 'error' dans la propriété 'status', en cas d'erreur
 * @async
 * @function
 * @param {Object} param
 * @param {RowImportPlace} param.data une ligne du fichier d'import de places
 * @param {string} param.departement Département sélectionné
 * @return {Promise<RowObjectPlace|PlaceStatus>}
 */
const parseRow = async ({ data, departement }) => {
  const loggerInfo = {
    section: 'admin-import-places',
    action: 'parseRow',
    data,
    departement,
  }
  let myCentre
  let myMatricule
  let myDate

  try {
    const [day, time, matricule, nom, centre, dept] = data

    myCentre = centre && centre.trim()
    myMatricule = matricule && matricule.trim()
    const myDay = day && day.trim()

    let myTime = time && time.trim()
    const myNom = nom && nom.trim()

    const myDept = dept && dept.trim()

    if (!myDay || !myTime || !myMatricule || !myNom || !myCentre || !myDept) {
      const error = new Error(
        `Une ou plusieurs information(s) manquante(s) dans le fichier CSV ou XLSX.
        [
          date: ${myDay || ''},
          heur: ${myTime || ''},
          matricule: ${myMatricule || ''},
          nom: ${myNom || ''},
          centre: ${myCentre || ''},
          departement: ${myDept || ''}
        ]`,
      )
      error.from = 'parseRow'
      throw error
    }
    myTime = /..:../.test(myTime) ? myTime : '0' + myTime
    myDate = `${myDay} ${myTime}`
    const date = DateTime.fromFormat(
      myDate,
      'dd/MM/yy HH:mm',
      FRENCH_LOCALE_INFO,
    )

    if (dept.trim() !== departement) {
      const error = new Error(
        `Le département du centre (${dept.trim()}) ne correspond pas au département dont vous avez la charge (${departement})`,
      )
      error.from = 'parseRow'
      throw error
    }

    if (!date.isValid) {
      const error = new Error('Date est invalide')
      error.from = 'parseRow'
      throw error
    }

    // TODO: create test unit for search centre by center name and departement
    const foundCentre = await findCentreByNameAndDepartement(
      centre.trim(),
      departement,
    )
    if (!foundCentre) {
      const error = new Error(`Le centre ${centre.trim()} est inconnu`)
      error.from = 'parseRow'
      throw error
    }

    const inspecteurFound = await findInspecteurByMatricule(matricule.trim())
    if (!inspecteurFound) {
      const error = new Error(`L'inspecteur ${matricule.trim()} est inconnu`)
      error.from = 'parseRow'
      throw error
    }

    if (inspecteurFound.nom.toUpperCase() !== nom.trim().toUpperCase()) {
      const error = new Error(
        `Le nom "${nom.trim()}" de l'inspecteur ne correspond pas au matricule "${matricule.trim()}"`,
      )
      error.from = 'parseRow'
      throw error
    }

    if (!AUTHORIZED_HOURS.includes(myTime)) {
      const error = new Error(
        "La place n'est pas enregistrée. La place est en dehors de la plage horaire autorisée.",
      )
      error.from = 'parseRow'
      throw error
    }

    return {
      departement,
      centre: foundCentre,
      inspecteur: inspecteurFound._id,
      date,
    }
  } catch (error) {
    let message = UNKNOWN_ERROR_UPLOAD_PLACES
    if (error.from) {
      appLogger.warn({
        ...loggerInfo,
        description: error.message,
        error,
      })
      message = error.message
    } else {
      appLogger.error({
        ...loggerInfo,
        description: error.message,
        error,
      })
    }

    return getPlaceStatus(
      departement,
      myCentre,
      myMatricule,
      myDate,
      'error',
      message,
    )
  }
}
/**
 * Crée une place importée dans la base de données
 * @async
 * @function
 * @param {RowObjectPlace} place
 * @return {Promise<PlaceStatus>}
 */
const createPlaceFromFile = async place => {
  const loggerInfo = {
    func: 'createPlaceFromFile',
  }
  const { centre, inspecteur, date } = place
  try {
    const visibleAt = getDateVisibleForPlaces()
    const leanPlace = { inspecteur, date, centre: centre._id, visibleAt }
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
      'Place enregistrée en base',
    )
  } catch (error) {
    loggerInfo.place = { centre, inspecteur, date }
    appLogger.warn({ ...loggerInfo, error })
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
        'Place déjà enregistrée en base',
      )
    }
    return getPlaceStatus(
      centre.departement,
      centre.nom,
      inspecteur,
      date,
      'error',
      error.message,
    )
  }
}

/**
 * Importe les places d'un département dans un fichier CSV.
 * @async
 * @function
 * @param {Object} param
 * @param {string} param.csvFile Nom du fichier .csv
 * @param {string} param.departement Département sélectionné
 * @return {Promise<PlaceStatus[]>}
 */
export const importPlacesCsv = async ({ csvFile, departement }) => {
  const loggerInfo = {
    func: 'importPlacesCsv',
  }
  const PlacesPromise = []

  if (!departement) {
    const error = new Error('DEPARTEMENT_IS_MANDATORY')
    error.from = 'importPlacesCsv'
    throw error
  }

  return new Promise((resolve, reject) =>
    csvParser
      .parseString(csvFile.data.toString(), {
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
            description: error.message,
            error,
          })
        }
      })
      .on('data', place => {
        PlacesPromise.push(createPlaceFromFile(place))
      })
      .on('end', () => {
        resolve(Promise.all(PlacesPromise))
      }),
  )
}
/**
 * Importe les places d'un département dans un fichier XLSX.
 * @async
 * @function
 * @param {Object} param
 * @param {string} param.xlsxFile Nom du fichier .xlsx
 * @param {string} param.departement Département sélectionné
 * @return {Promise<PlaceStatus[]>}
 */
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
        }),
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

/**
 * Exception pour les erreurs d'import des places
 * @typedef {Error} ErrorImportPlace
 * @property {string} from vaut importPlacesFromFile, pour indiquer la provenance d'exception dans les traces
 */

/**
 * Redirige vers les fonctions d'import des places suivant l'extension du fichier à importer
 * - La fonction pour l'import des fichiers CSV est [importPlacesCsv]{@link import('./places-business')..importPlacesCsv}
 * - La fonction pour l'import des fichiers XLSX est [importPlacesXlsx]{@link import('./places-business')..importPlacesXlsx}
 * @async
 * @function
 * @param {Object} param Paramètre anonyme
 * @param {string} param.planningFile Nom du fichier à traiter avec l'extension .csv ou xlsx
 * @param {string} param.departement Département actif de l'utilisateur
 * @return {Promise<PlaceStatus[]>}
 * @throws {ErrorImportPlace} error Envoie une exception si l'extension n'est ni .csv, ni .xlsx
 *
 */
export const importPlacesFromFile = async ({ planningFile, departement }) => {
  if (planningFile.name.endsWith('.csv')) {
    return importPlacesCsv({ csvFile: planningFile, departement })
  }
  if (planningFile.name.endsWith('.xlsx')) {
    return importPlacesXlsx({ xlsxFile: planningFile, departement })
  }

  const error = new Error(`Format du fichier inattendu (${planningFile.name})`)
  error.from = 'importPlacesFromFile'
  throw error
}

/**
 * Résultat d'une place non réservé
 * @typedef {Object} PlaceWithoutCandidat
 * @property {string} departement
 * @property {string} centre
 * @property {string} inspecteur
 * @property {string} date
 */

/**
 * Supprime la réservation du candidat par son identifiant
 * @async
 * @function
 * @param {Object} param Paramètre anonyme
 * @param {import('mongoose').Schema.Types.ObjectId|string} param._id Identifiant du candidat
 *
 * @return {Promise<PlaceWithoutCandidat>}
 */
export const releaseResa = async ({ _id }) => {
  // const loggerInfo = {
  //   func: 'releaseResa',
  //   candidatId: _id,
  // }
  const place = await findPlaceBookedByCandidat(_id)
  if (place) {
    // appLogger.debug({
    //   func: 'releaseResa',
    //   acion: 'remove-place',
    //   candidatId: _id,
    //   place,
    // })
    return removeBookedPlace(place)
  }
}

/**
 * Résultat d'une place non réservé
 * @typedef {Object} statusResultRemoveByAdmin
 * @property {string} statusmail
 * @property {string} message
 * @property {object} candidat
 * @property {object} placeUpdated
 */

/**
* Supprimer une réservation par un admin.
* @async
* @function
* @param {object} place - Place a supprimer.
* @param {object} candidat - Candidat(e) ayant réservé la place.
* @param {object} admin - Adminstrateur à l'origine de l'action.
*
* @return {statusResultRemoveByAdmin}
*/
export const removeReservationPlaceByAdmin = async (place, candidat, admin) => {
  const loggerInfo = {
    func: 'removeReservationPlaceByAdmin',
    placeId: place._id,
    candidatId: candidat._id,
    adminId: admin._id,
  }
  // appLogger.debug(loggerInfo)

  // Annuler la place
  const placeUpdated = await removeBookedPlace(place)
  // Archive place
  let candidatUpdated = addPlaceToArchive(
    candidat,
    place,
    REASON_REMOVE_RESA_ADMIN,
    admin.email,
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

  const { _id, email, nomNaissance, prenom, portable } = candidatUpdated

  return {
    statusmail,
    message,
    candidat: {
      _id,
      email,
      nomNaissance,
      prenom,
      portable,
    },
    placeUpdated,
  }
}

/**
* Créée une place pour un inspecteur.
* @async
* @function
* @param {object} centre - Centre de plannification.
* @param {string} inspecteur - Inspecteur à plannifier.
* @param {string} date - Date et heur du crénaux.

* @return {PlaceStatus}
*/
export const createPlaceForInspector = async (centre, inspecteur, date) => {
  const loggerInfo = {
    func: 'createPlaceForInspector',
    centreId: centre._id,
    inspecteur,
    dateStr: date,
  }
  // appLogger.debug(loggerInfo)

  const myDate = date
  try {
    loggerInfo.action = 'createPlaceForInspector'

    const formatedDate = DateTime.fromFormat(myDate, 'dd/MM/yy HH:mm', {
      zone: 'Europe/Paris',
      locale: 'fr',
    })
    const visibleAt = getDateVisibleForPlaces()
    const leanPlace = { inspecteur, date: formatedDate, centre: centre._id, visibleAt }
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
      'Place enregistrée en base',
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
        'Place déjà enregistrée en base',
      )
    }
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })
    return getPlaceStatus(
      centre.departement,
      centre.nom,
      inspecteur,
      date,
      'error',
      error.message,
    )
  }
}

/**
 * Résultat d'une place réservable lorsque l'on souhaite modifier l'inspecteur d'une place existante.
 * @typedef {Object} bookablePlace
 * @property {object} resa
 * @property {object} place
 */

/**
* Permet de vérifier si un inspecteur peut en remplacer un autre sur le même céneau horaire.
* @async
* @function
* @param {string} resaId - Identifiant de la place à comparer.
* @param {string} inspecteur - Inspecteur potentielement disponible.

* @return {bookablePlace}
*/
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

/**
* Permet de changer le candidat de place.
* @async
* @function
* @param {RowObjectBookedPlace} previousBookedPlace - Place initialement réservée.
* @param {RowObjectPlace} place - Nouvelle place.
* @return {RowObjectBookedPlace}
*/
export const moveCandidatInPlaces = async (previousBookedPlace, place) => {
  const placeId = place._id
  const { candidat, bookedAt, bookedByAdmin } = previousBookedPlace
  const loggerContent = {
    func: 'moveCandidatInPlaces',
    resaId: previousBookedPlace._id,
    placeId,
  }

  // appLogger.debug({
  //   ...loggerContent,
  //   action: 'BOOK_RESA',
  //   placeId,
  //   candidat,
  // })

  await setBookedPlaceKeyToFalseOrTrue(previousBookedPlace, false)

  let newBookedPlace
  let messageError
  try {
    newBookedPlace = await bookPlaceById(placeId, candidat, {
      bookedAt,
      bookedByAdmin,
    })
  } catch (error) {
    appLogger.error({ ...loggerContent, error, description: error.message })
    messageError = `L'Affection du candidat a échoué ${error.code === 11000 ? ', le candidat a une autre réservation.' : '.'}`
  }

  if (!newBookedPlace) {
    await setBookedPlaceKeyToFalseOrTrue(previousBookedPlace, true)
    throw new ErrorWithStatus(400, messageError || 'Cette place possède une réservation')
  }

  // appLogger.debug({
  //   ...loggerContent,
  //   action: 'DELETE_RESA',
  //   resaId,
  // })

  await deletePlace(previousBookedPlace)

  return newBookedPlace
}

/**
 * @typedef {Object} StatusMail
 * @property {boolean} status Status de l'envoi du courriel.
 * @property {string} message Message d'informations.
 */

/**
 * Place réservé par un candidat.
 * @typedef {Object} RowObjectBookedPlace
 * @property {string} departement Département sélectionné.
 * @property {import('mongoose').Schema.Types.ObjectId|string} centre Identifiant du centre enregistré dans la base de données.
 * @property {import('mongoose').Schema.Types.ObjectId|string} inspecteur Identifiant d'un inspecteur enregistré dans la base de données.
 * @property {import('mongoose').Schema.Types.ObjectId|string} candidat Identifiant d'un candidat enregistré dans la base de données.
 * @property {import('luxon').DateTime} date La date et heure de la place.
 */

/**
 * Place réservé par un candidat et le status de l'envoi de courriel.
 * @typedef {Object} StatusAssignationPlace
 * @property {RowObjectBookedPlace} newBookedPlace Place réservé.
 * @property {object} candidat Candidat affecté à la place.
 * @property {StatusMail} statusmail Status du resultat de la réservation.
 */

/**
* Affecter un candidat sur une place.
* @param {string} candidatId - Identifiant du candidat.
* @param {string} placeId - Identifiant du de la place.
* @param {object} admin - Identifiant du candidat.
* @return {StatusAssignationPlace}
*/
export const assignCandidatInPlace = async (candidatId, placeId, admin) => {
  const loggerContent = {
    section: 'admin-assign-candidat-in-places',
    candidatId,
    placeId,
    admin: admin._id,
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

  const dateReussiteETG = getFrenchLuxonFromJSDate(candidat.dateReussiteETG)
  const datePlace = getFrenchLuxonFromJSDate(place.date)
  if (
    // TODO: remove next line after 31/12/2020
    isETGExpired(dateReussiteETG, datePlace)
    // TODO: Uncomment next compare after 31/12/2020
    // dateReussiteETG
    //   .plus({
    //     year: NB_YEARS_ETG_EXPIRED,
    //   })
    //   .endOf('day') < datePlace
  ) {
    throw new ErrorWithStatus(
      400,
      'Date ETG ne sera plus valide pour cette place',
    )
  }

  const placeAlreadyBookedByCandidat = await findPlaceBookedByCandidat(
    candidatId,
  )

  const { _id, departements, signUpDate, status, email } = admin
  if (placeAlreadyBookedByCandidat) {
    await setBookedPlaceKeyToFalseOrTrue(placeAlreadyBookedByCandidat, false)
  }

  const newBookedPlace = await bookPlaceById(
    placeId,
    candidatId,
    {
      bookedAt: getFrenchLuxon().toJSDate(),
      bookedByAdmin: {
        _id,
        departements,
        signUpDate,
        status,
        email,
      },
    },
    'centre candidat date inspecteur',
    {
      candidat: true,
      centre: true,
    },
  )

  if (!newBookedPlace) {
    if (placeAlreadyBookedByCandidat) {
      await setBookedPlaceKeyToFalseOrTrue(placeAlreadyBookedByCandidat, true)
    }
    throw new ErrorWithStatus(400, PLACE_IS_ALREADY_BOOKED)
  }

  if (placeAlreadyBookedByCandidat) {
    await removeBookedPlace(placeAlreadyBookedByCandidat)
    await archivePlace(
      candidat,
      placeAlreadyBookedByCandidat,
      REASON_MODIFY_RESA_ADMIN,
      admin.email,
    )
  }
  const deptCentre = newBookedPlace.centre.departement
  if (deptCentre !== candidat.departement) {
    newBookedPlace.candidat = await updateCandidatDepartement(
      candidat,
      deptCentre,
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

/**
 * Place réservé par un candidat et le status de l'envoi de courriel.
 * @typedef {string[]} RowInspecteurIdListe
 * @property {string} - identifiant d'inspecteur.
 */

/**
 * Resultat de l'envoi des bordereaux.
 * @typedef {Object} SendBordereauxResult
 * @property {boolean} success - Status de l'action.
 * @property {array} inspecteurs - Contient des informations liée aux erreurs, cette valeur n'existe que en cas d'erreurs.
 */

/**
* Permet d'envoyer les bordereaux aux inspecteurs.
* @function
* @async
* @param {string} departementEmail - Adresse courriel de du département.
* @param {string} departement - Identifiant du département.
* @param {import('luxon').DateTime} date - Date de la plannification à envoyer.
* @param {boolean} isForInspecteurs - Si la valeur est 'true' les bordereaux seront envoyé aux inspecteurs sinon au répartiteur.
* @param {RowInspecteurIdListe} inspecteurIdListe - Liste d'identifant d'inspecteurs.
*
* @return {SendBordereauxResult}
*/
export const sendMailSchedulesInspecteurs = async (
  departementEmail,
  departement,
  date,
  isForInspecteurs,
  inspecteurIdListe,
) => {
  const loggerContent = {
    section: 'admin-send-mail-schedule-inspecteurs',
    departement,
    date,
    departementEmail,
    inspecteurIdListe,
  }

  // appLogger.debug({
  //   ...loggerContent,
  //   func: 'sendMailSchedulesInspecteurs',
  // })

  const { begin: beginDate, end: endDate } = getFrenchLuxonRangeFromDate(date)

  const placesByInspecteurs = {}
  const centres = await findCentresByDepartement(departement)

  await Promise.all(
    centres.map(async centre => {
      const places = await findAllPlacesBookedByCentreAndInspecteurs(
        centre._id,
        inspecteurIdListe,
        beginDate,
        endDate,
      )
      places.map(place => {
        const { inspecteur: inspecteurId } = place
        if (!placesByInspecteurs[inspecteurId]) {
          placesByInspecteurs[inspecteurId] = []
        }

        placesByInspecteurs[inspecteurId].push(place)
      })
    }),
  )

  const resultsError = []
  await Promise.all(
    Object.entries(placesByInspecteurs).map(async ([inspecteurId, places]) => {
      try {
        let inspecteurMail
        if (isForInspecteurs) {
          const inspecteurToMail = await findInspecteurById(inspecteurId)
          inspecteurMail = [inspecteurToMail.secondEmail, inspecteurToMail.email].flat()
        }
        await sendScheduleInspecteur(
          isForInspecteurs ? inspecteurMail : departementEmail,
          places,
        )
        appLogger.info({
          ...loggerContent,
          inspecteur: inspecteurId,
          nbPlaces: places.length,
          emailTo: isForInspecteurs ? inspecteurMail : departementEmail,
          emailInspecteur: isForInspecteurs ? inspecteurMail : null,
          description: 'Bordereau envoyé',
        })
        return { success: true }
      } catch (error) {
        appLogger.error({
          ...loggerContent,
          description: error.message,
          error,
          inspecteur: inspecteurId,
        })
        const inspecteur = await findInspecteurById(inspecteurId)
        resultsError.push(inspecteur)
      }
    }),
  )

  if (resultsError.length) {
    try {
      await sendMailForScheduleInspecteurFailed(
        departementEmail,
        date,
        departement,
        resultsError,
      )
    } catch (error) {
      appLogger.error({ ...loggerContent, error })
    }
    return { success: false, inspecteurs: resultsError }
  }
  return { success: true }
}

/**
 * Resultat de l'envoi d'un bordereaux pour un inspecteur.
 * @typedef {Object} RowStatusSendBordereaux
 * @property {boolean} success - Status de l'action.
 * @property {import('mongoose').Schema.Types.ObjectId|string} inspecteur - Identifiant de l'inspecteur.
 * @property {number} nbPlaces - Nombres de crénaux plannifié pour l'inspecteur.
 */

/**
* Permet d'envoyer les bordereaux aux inspecteurs.
* @function
* @async
* @param {import('luxon').DateTime} date - Date de la plannification à envoyer.
*
* @return {RowStatusSendBordereaux[]}
*/
export const sendMailSchedulesAllInspecteurs = async (date, loggerInfo = {}) => {
  const loggerContent = {
    ...loggerInfo,
    func: 'sendMailSchedulesAllInspecteurs',
    date,
  }
  // appLogger.debug({
  //   ...loggerContent,
  // })

  const { begin, end } = getFrenchLuxonRangeFromDate(date)

  const inspecteurs = await findAllInspecteurs()

  const resultsAsync = inspecteurs.map(async inspecteur => {
    const { _id, email, secondEmail } = inspecteur
    let nbPlaces = 0
    const places = await findPlaceBookedByInspecteur(_id, begin, end)
    if (places && places.length > 0) {
      nbPlaces = places.length
      try {
        await sendScheduleInspecteur([email, secondEmail].flat(), places, inspecteur, undefined, true)
        appLogger.info({
          ...loggerContent,
          inspecteurId: _id,
          nbPlaces: places.length,
          email,
          description: 'Bordereau envoyé',
        })
      } catch (error) {
        appLogger.error({ ...loggerContent, inspecteur: _id, error })
        return { success: false, inspecteur }
      }
    }
    appLogger.warn({
      ...loggerContent,
      inspecteur: _id,
      nbPlaces: 0,
      email,
      description: 'Pas de réservarion',
    })
    return { success: true, nbPlaces, inspecteur }
  })
  const results = await Promise.all(resultsAsync)
  // appLogger.debug({
  //   ...loggerContent,
  //   results,
  // })

  sendMails()
  return results
}
