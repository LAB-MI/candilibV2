import moment from 'moment'

import ArchivedCandidat from '../archived-candidat/archived-candidat.model'
import Candidat from './candidat.model'
import Place from '../place/place.model'
import { getFrenchFormattedDateTime, getFrenchLuxon, techLogger } from '../../util'
import { queryPopulate } from '../util/populate-tools'
import { candidatValidator } from '../../util/validators/candidat-validator'
import { candidatStatuses } from '../../routes/common/candidat-status-const'
import { addArchivedCandidatStatus } from '../archived-candidat-status/archived-candidat-status-queries'
import { NbDaysInactivityDefault } from '../../config'

/**
 * Crée un candidat
 *
 * @async
 * @function
 *
 * @param {CandidatFormData}
 *
 * @returns {Promise.<Candidat>}
 */
export const createCandidat = async (candidatFormData) => {
  const {
    adresse,
    codeNeph,
    email,
    emailValidationHash,
    isValidatedEmail,
    nomNaissance,
    portable,
    prenom,
    departement,
    homeDepartement,
    // ci dessous les arguments utilisé que pour l'enviromment de test
    // createdAt,
    // isValidatedByAurige,
    // canAccessAt,
    // canBookFrom,
    // status,
    // token,
    // tokenAddedAt,
    // lastConnection,
  } = candidatFormData

  const validated = await candidatValidator.validateAsync({
    adresse,
    codeNeph,
    email,
    emailValidationHash,
    isValidatedEmail,
    nomNaissance,
    portable,
    prenom,
    departement,
    homeDepartement,
  })

  if (validated.error) throw new Error(validated.error)

  const newCandidat = {
    adresse,
    codeNeph,
    email,
    emailValidationHash,
    isValidatedEmail,
    nomNaissance,
    portable,
    prenom,
    presignedUpAt: new Date(),
    departement,
    homeDepartement: homeDepartement || departement,
  }

  if (process.env.NODE_ENV === 'test') {
    [
      'createdAt',
      'isValidatedByAurige',
      'canAccessAt',
      'canBookFrom',
      'status',
      'token',
      'tokenAddedAt',
      'lastConnection',
    ].forEach(key => {
      if (candidatFormData[key]) {
        newCandidat[key] = candidatFormData[key]
      }
    })
  }

  const candidat = new Candidat(newCandidat)
  await candidat.save()
  return candidat
}

// TODO: JSDOC
const getSortableCandilibStatusAndSortCreatedAt = (now, dateLastConnexion) => Candidat
  .find({
    isValidatedByAurige: true,
    token: { $exists: true },
    $and: [
      {
        $or: [
          { canAccessAt: { $exists: false } },
          { canAccessAt: { $lt: now } },
        ],
      },
      {
        $or: [
          { canBookFrom: { $exists: false } },
          { canBookFrom: { $lt: now } },
        ],
      },
    ],
    lastConnection: { $gte: dateLastConnexion },
  }, { _id: 1, createdAt: 1, departement: 1, status: 1, homeDepartement: 1 })
  .sort('createdAt')

// TODO: JSDOC
const getSortableCandilibInLastStatus = async (now, dateLastConnexion) => Candidat.find({
  isValidatedByAurige: true,
  $or: [
    { token: { $exists: false } },
    { canAccessAt: { $gte: now } },
    { canBookFrom: { $gte: now } },
    { lastConnection: { $lt: dateLastConnexion } },
  ],
}, { _id: 1, departement: 1, status: 1 })

// TODO: JSDOC
const groupByAndIds = (status) => (acc, curCandidat) => {
  if (!acc.countByDep[curCandidat.homeDepartement]) { acc.countByDep[curCandidat.homeDepartement] = 0 }
  acc.countByDep[curCandidat.homeDepartement]++
  acc.ids.push(curCandidat._id)
  acc.toArchivedStatus.push({ candidatId: curCandidat._id, hasModified: (curCandidat.status && status !== curCandidat.status) })
  return acc
}

/**
* Parmet la recupération du nombre de mois par rapport à la date du jour.
* @property {String} date - Date au format JSDate.
*/
const getDiffNowInMonthFromJsDate = (date) => getFrenchFormattedDateTime(date).date

// TODO: JSDOC
export const sortCandilibStatus = async () => {
  const countStatus = candidatStatuses.nbStatus
  const nowLuxon = getFrenchLuxon()
  const now = nowLuxon.toJSDate()
  const dateLastConnexion = nowLuxon.minus({ days: NbDaysInactivityDefault }).toISODate()

  const candidats = await getSortableCandilibStatusAndSortCreatedAt(now, dateLastConnexion)

  const candidatsCount = candidats.length
  const groupeSize = Math.floor(candidatsCount / countStatus)

  const updatedCandidat = []
  const countByStatus = {}
  const statusBorne = {}

  for (let index = 0; index < countStatus; index++) {
    const status = `${index}`
    const candidatsTmp = candidats.slice(
      index * groupeSize,
      index === 5 ? undefined : (groupeSize * (index + 1)),
    )

    const results = candidatsTmp.reduce(groupByAndIds(status), { countByDep: {}, ids: [], toArchivedStatus: [] })

    if (results.ids.length) {
      statusBorne[index] = {
        olderDate: getDiffNowInMonthFromJsDate(candidatsTmp[0].createdAt),
        newerDate: getDiffNowInMonthFromJsDate(candidatsTmp[candidatsTmp.length - 1].createdAt),
      }
      const statusFirst = await Candidat.updateMany(
        { _id: { $in: results.ids } },
        { $set: { status } },
      )
      await addArchivedCandidatStatus(status, results.toArchivedStatus)

      updatedCandidat.push(statusFirst)
    } else {
      techLogger.warn({
        section: 'SORT-CANDIDAT-BY-STATUS',
        action: 'STATUS-EMPTY',
        description: `status ${index} n' a aucun candidats`,
      })
    }
    countByStatus[index] = results.countByDep
  }

  const candidatsLastStatus = await getSortableCandilibInLastStatus(now, dateLastConnexion)

  if (candidatsLastStatus && candidatsLastStatus.length) {
    const index = countStatus - 1
    const status = `${index}`
    const idsLastStatus = candidatsLastStatus.reduce(groupByAndIds(status), { countByDep: {}, ids: [], toArchivedStatus: [] })

    const lastStatus = await Candidat.updateMany(
      { _id: { $in: idsLastStatus.ids } },
      { $set: { status } },
    )
    await addArchivedCandidatStatus(status, idsLastStatus.toArchivedStatus)

    updatedCandidat.push(lastStatus)

    for (const [key, value] of Object.entries(idsLastStatus.countByDep)) {
      if (!countByStatus[index][key]) countByStatus[index][key] = 0
      countByStatus[index][key] += value
    }
  }

  return ({ countByStatus, updatedCandidat, statusBorne })
}

// TODO: JSDOC
export const countCandidatsByStatus = async (status) =>
  Candidat.find({ status: status }).countDocuments()

/**
 * Renvoie la liste de tous les candidats sous forme d'objets non attachés à mongoose
 *
 * @async
 * @function
 *
 * @returns {Promise.<Candidat>}
 */
export const findAllCandidatsLean = async () => {
  const candidats = await Candidat.find({}).lean()
  return candidats
}

/**
 * Renvoie le candidat par la recherche avec son adresse courriel
 *
 * @async
 * @function
 *
 * @param {Object} email - Adresse courriel du candidat
 *
 * @returns {Promise.<Candidat>}
 */

export const findCandidatByEmail = async email => {
  const candidat = await Candidat.findOne({ email })
  return candidat
}

/**
 * Renvoie le candidat par la recherche avec son id
 *
 * @async
 * @function
 *
 * @param {string} id - Identitifiant du candidat
 * @param {string} options - Options mongoose pour la query de recherche candidat
 *
 * @returns {Promise.<Candidat>}
 */
export const findCandidatById = async (id, options, populate) => {
  if (options && options.dateDernierEchecPratique) {
    options.noReussites = 1
  }

  const query = Candidat.findById(id, options)
  queryPopulate(populate, query)
  const candidat = await query.exec()
  return candidat
}

/**
 * Renvoie la recherche du candidat avec son nom de naissance, son prénom, son codeNeph ou son adresse courriel
 *
 * @async
 * @function
 *
 * @param {string} $search - Expression rationnelle pour la recherche par le nom, prénom, code NEPH et adresse courriel
 *
 * @returns {Promise.<Candidat[]>}
 */
export const findCandidatsMatching = async (
  $search,
  startingWith,
  endingWith,
) => {
  const MAX_RESULT = 300
  const search = `${startingWith ? '^' : ''}${$search}${endingWith ? '$' : ''}`
  const searchRegex = new RegExp(`${search}`, 'i')

  const nbResultsMax = await Candidat.count({
    $or: [
      { nomNaissance: searchRegex },
      { prenom: searchRegex },
      { codeNeph: searchRegex },
      { email: searchRegex },
    ],
  })
  const candidats = await Candidat.find({
    $or: [
      { nomNaissance: searchRegex },
      { prenom: searchRegex },
      { codeNeph: searchRegex },
      { email: searchRegex },
    ],
  }).limit(MAX_RESULT)

  let searchText = $search
  if (startingWith && endingWith) {
    searchText = `\\"${$search}\\"`
  }

  const fullTextCandidats = await Candidat.find(
    { $text: { $search: searchText } },
    { score: { $meta: 'textScore' } },
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(MAX_RESULT)

  return {
    candidats: [
      ...candidats,
      ...fullTextCandidats.filter(
        candidat =>
          !candidats.some(
            cand => cand._id.toString() === candidat._id.toString(),
          ),
      ),
    ],
    nbResultsMax,
  }
}

/**
 * Récupère le candidat par la recherche avec son nom et son code NEPH
 *
 * @async
 * @function
 *
 * @param {string} nomNaissance - Nom de naissance du candidat
 * @param {string} codeNeph - NEPH du candidat
 *
 * @returns {Promise.<Candidat>}
 */
export const findCandidatByNomNeph = async (nomNaissance, codeNeph) => {
  const candidat = await Candidat.findOne({ codeNeph, nomNaissance })
  return candidat
}

/**
 * Archive le candidat trouvé par son nom de naissance et son code NEPH (passés en paramètres)
 * de la base de données, et le renvoie
 *
 * @async
 * @function
 *
 * @param {string} nomNaissance - Nom de naissance du candidat
 * @param {string} codeNeph - Code NEPH du candidat
 * @param {string} reason - Raison de l'archivage du candidat
 *
 * @returns {Promise.<Candidat>}
 */
export const deleteCandidatByNomNeph = async (
  nomNaissance,
  codeNeph,
  reason,
) => {
  const candidat = await findCandidatByNomNeph(nomNaissance, codeNeph)
  if (!candidat) {
    throw new Error('No candidat found')
  }
  await deleteCandidat(candidat, reason)
  return candidat
}

/**
 * Archive le candidat (passé en paramètre) de la base de données, et le renvoie
 *
 * @async
 * @function
 *
 * @param {Candidat} candidat - Candidat
 * @param {string} reason - Raison de l'archivage du candidat
 *
 * @returns {Promise.<Candidat>}
 */
export const deleteCandidat = async (candidat, reason) => {
  if (!candidat) {
    throw new Error('No candidat given')
  }
  try {
    const cleanedCandidat = candidat.toObject ? candidat.toObject() : candidat
    cleanedCandidat.candidatId = cleanedCandidat._id
    delete cleanedCandidat._id
    cleanedCandidat.archiveReason = reason
    await ArchivedCandidat.create(cleanedCandidat)
  } catch (error) {
    techLogger.error({
      func: 'query-candidat-delete',
      action: 'archive-candidat',
      description: `Could not archive candidat: ${candidat.nomNaissance} ${candidat.codeNeph} ${error.message}`,
      error,
    })
  }
  await Candidat.findByIdAndDelete(candidat._id)
  return candidat
}

/**
 * Met à jour l'adresse courriel du candidat et le renvoi
 *
 * @async
 * @function
 *
 * @param {Candidat} candidat - Candidat
 * @param {string} email - Adresse courriel du candidat
 *
 * @returns {Promise.<Candidat>}
 */
export const updateCandidatEmail = async (candidat, email) => {
  if (!candidat) {
    throw new Error('candidat is undefined')
  }
  await candidat.updateOne({ email })
  const updatedCandidat = await Candidat.findById(candidat._id)
  return updatedCandidat
}

/**
 * Met à jour le token du candidat
 *
 * @async
 * @function
 *
 * @param {String} candidatId - Identifiant du Candidat
 * @param {string} token - Nouveau token
 *
 * @returns {Promise}
 */
export const updateCandidatToken = async (candidatId, token) => {
  if (!candidatId) {
    throw new Error('candidat is undefined')
  }

  return Candidat.updateOne({ _id: candidatId }, { $set: { token, tokenAddedAt: getFrenchLuxon().toISO() } })
}

/**
 * Renvoie les candidats qui ont réservé une place d'examen le jour donné (date passé en paramètre)
 *
 * @async
 * @function
 *
 * @param {string} date - Date du jour de l'examen au format ISO
 * @param {string} inspecteur - Identifiant de l'inspecteur
 * @param {string} centre - Identifiant du centre d'examen
 *
 * @returns {Promise.<Candidat[]>} Liste des candidats ayant réservé ce jour avec cet inspecteur dans ce centre
 */
export const findBookedCandidats = async (date, inspecteur, centre) => {
  let query = Place.where('candidat').exists(true)
  if (date && moment(date).isValid()) {
    const startDate = moment(date)
      .startOf('day')
      .toISOString()
    const endDate = moment(date)
      .endOf('day')
      .toISOString()
    query
      .where('date')
      .gte(startDate)
      .lt(endDate)
  }

  if (inspecteur) {
    query = query.where('inspecteur', inspecteur)
  }

  if (centre) query = query.where('centre', centre)

  const places = await query.populate('centre').exec()
  if (places) {
    const candidats = await Promise.all(
      places.map(async place => {
        const { candidat: id } = place
        const candidat = await Candidat.findById(id)
        if (!candidat) return {}
        candidat.place = place
        return candidat
      }),
    )
    return candidats
  }
  return null
}

/**
 * Met à jour les informations (prénom, adresse courriel, portable, adresse) du candidat et le renvoie
 *
 * @async
 * @function
 *
 * @param {Object} candidat - candidat
 * @param {Object} data - Données du candidat
 * @param {string} prenom - Prénom du candidat
 * @param {string} email - Adresse courriel du candidat
 * @param {string} portable - Numéro de téléphone mobile du candidat
 * @param {string} adresse - Adresse postale du candidat
 *
 * @returns {Promise.<Candidat>}
 */
export const updateCandidatSignUp = async (candidat, data) => {
  const { prenom, email, portable, adresse } = data

  if (!candidat) {
    throw new Error('candidat is undefined')
  }
  await candidat.updateOne({ prenom, email, portable, adresse })
  const updatedCandidat = await Candidat.findById(candidat._id)
  return updatedCandidat
}

/**
 * Met à jour le candidat avec les données passées en paramètre et le renvoie
 *
 * @async
 * @function
 *
 * @param {string} id - Identifiant du candidat
 * @param {CandidatUpdateData} updatedData - Données à modifier du candidat
 *
 * @returns {Promise.<Candidat>}
 */
export const updateCandidatById = async (id, updatedData) => {
  const updateInfo = await Candidat.findByIdAndUpdate(id, updatedData)
  return updateInfo
}

/**
 * Met à jour la date à laquelle le candidat peut réserver une place
 *
 * @async
 * @function
 *
 * @param {Candidat} candidat - Candidat
 * @param {Date} canBookFrom - Date possible de réservation d'une place
 *
 * @returns {Promise.<Candidat>}
 */
export const updateCandidatCanBookFrom = async (candidat, canBookFrom, candidatStatus) => {
  if (candidatStatus) {
    candidat.status = candidatStatus
  }
  candidat.canBookFrom = canBookFrom
  return candidat.save()
}

/**
 * Met à jour la date de première connexion du candidat si elle existe
 *
 * @async
 * @function
 *
 * @param {string} id - Identifiant du candidat
 *
 * @returns {Promise.<Candidat>}
 */
export const setCandidatFirstConnection = async id => {
  const candidat = await findCandidatById(id)
  if (!candidat.firstConnection) {
    candidat.firstConnection = new Date()
    return candidat.save()
  }
  return candidat
}

export const setCandidatLastConnection = async id => {
  return await Candidat.updateOne({ _id: id }, { $set: { lastConnection: new Date() } })
}

/**
 * Ajoute dans les places archivées du candidat la place passée en paramètre
 * et renvoie le candidat mis à jour
 *
 * @async
 * @function
 *
 * @param {Candidat} candidat - Candidat qui a réservé la place
 * @param {Place} place - Place à archiver
 * @param {string} reason - Raison de l'archivage
 * @param {string=} byUser - Adresse courriel du répartiteur ou Délégué ou AURIGE ayant archivé la place le cas échéant
 * @param {boolean=} isCandilib - Présent et à `true` si le candidat a passé l'examen avec Candilib
 *
 * @returns {Promise.<Candidat>} - Candidat
 */
export const addPlaceToArchive = (
  candidat,
  place,
  reason,
  byUser,
  isCandilib,
) => {
  const { _id, inspecteur, centre, date, bookedAt, bookedByAdmin } = place
  const archivedAt = getFrenchLuxon()
  const archiveReason = reason
  if (!candidat.places) {
    candidat.places = []
  }
  candidat.places.push({
    _id,
    inspecteur,
    centre,
    date,
    archivedAt,
    archiveReason,
    byUser,
    isCandilib,
    bookedAt,
    bookedByAdmin,
    candidatStatus: candidat.status,
  })
  return candidat
}

/**
 * Archive une place d'un candidat, et renvoie ce candidat
 *
 * @async
 * @function
 *
 * @param {Candidat} candidat - Candidat pour lequel la place doit être archivée
 * @param {Place} place - Place à archiver
 * @param {string} reason - Raison de l'archivage de la place
 * @param {string=} byUser - Adresse courriel du répartiteur ou Délégué ou AURIGE ayant archivé la place le cas échéant
 * @param {boolean=} isCandilib - Présent et à `true` si le candidat a passé l'examen avec Candilib
 *
 * @returns {Promise.<Candidat>} - Candidat avec la nouvelle place archivée
 */
export const archivePlace = async (
  candidat,
  place,
  reason,
  byUser,
  isCandilib,
) => {
  candidat = addPlaceToArchive(candidat, place, reason, byUser, isCandilib)
  return candidat.save()
}

/**
 * Met à jour le candidat après un échec, et renvoie le candidat mis à jour
 *
 * @async
 * @function
 *
 * @param {Candidat} candidat - Candidat
 * @param {{ dateDernierEchecPratique, canBookFrom }} param -
 * @param {Date} dateDernierEchecPratique - Date du dernier échec pratique
 * @param {Date} canBookFrom - Date à partir de laquelle la place peut être réservée par le candidat
 *
 * @returns {Promise.<Candidat>} - Candidat mis à jour après une non réussite
 */
export const updateCandidatFailed = async (
  candidat,
  { dateDernierEchecPratique, canBookFrom },
) => {
  candidat.dateDernierEchecPratique = dateDernierEchecPratique
  candidat.canBookFrom = canBookFrom
  return candidat.save()
}

/**
 * Met à jour le candidat après une non-réussite, et renvoie le candidat mis à jour
 *
 * @async
 * @function
 *
 * @param {Candidat} candidat
 *
 * @returns {Promise.<Candidat>}
 */
export const updateCandidatNoReussite = async (
  candidat,
  { lastNoReussite, canBookFrom },
) => {
  candidat.lastNoReussite = lastNoReussite
  candidat.canBookFrom = canBookFrom
  return candidat.save()
}

/**
 * Enregistre le candidat comme étant VIP, et le renvoie
 *
 * @async
 * @function
 *
 * @param {Object} candidat - Candidat
 * @param {Date} resaCanceledByAdmin - Date de l'annulation de la place par un délégué ou un répartiteur
 *
 * @returns {Promise.<Candidat>} - Candidat mis à jour
 */
export const setCandidatToVIP = (candidat, resaCanceledByAdmin) => {
  candidat.resaCanceledByAdmin = resaCanceledByAdmin
  return candidat.save()
}

/**
 * Vérifie si le candidat existe, et renvoie `true` si c'est le cas, `false` sinon
 *
 * @async
 * @function
 *
 * @param {string} _id - Identifiant du candidat à trouver dans la base de données
 *
 * @returns {Promise.<boolean>} - `true` si un candidat existe avec cet identifiant
 */
export const isCandidatExisting = async _id => {
  const isExist = await Candidat.findOne({ _id }, { _id: 1, lastConnection: 1 })
  return isExist
}

/**
 * Compte le nombre de candidats validé par Aurige et qui ne sont pas dans la zone de rétention
 *
 * @async
 * @function
 *
 * @param {string} departement - Identifiant du département sélectionné
 *
 * @returns {Promise.<number>} - le nombre de candidat compté
 */
export const countCandidatsInscritsByDepartement = async departement => {
  const dateNow = getFrenchLuxon()
  return Candidat.countDocuments({
    departement,
    isValidatedByAurige: true,
    $or: [
      {
        canAccessAt: { $lt: dateNow },
      },
      {
        canAccessAt: { $exists: false },
      },
    ],
  })
}

export const findCandidatWithBooking = async (nomNaissance, codeNeph) => {
  const candidat = await Candidat.aggregate()
    .match({ codeNeph, nomNaissance })
    .lookup({
      from: 'places',
      localField: '_id',
      foreignField: 'candidat',
      as: 'booking',
    })
  return candidat[0]
}

/**
 * Compte le nombre de candidats validé par Aurige et qui ne sont pas dans la zone de rétention sur une période
 *
 * @async
 * @function
 *
 * @param {string} departement - Identifiant du département sélectionné
 * @param {string} startDate - Date au format ISO de debut de période
 * @param {string} endDate - Date au format ISO de fin période
 *
 * @returns {Promise.<number>} - le nombre de candidat compté
 */
export const countCandidatsInscritsByDepartementAndWeek = async (
  departement,
  startDate,
  endDate,
) => {
  const result = await Candidat.countDocuments({
    departement,
    isValidatedByAurige: true,
    $and: [
      {
        canAccessAt: { $exists: true },
      },
      {
        canAccessAt: { $gte: startDate },
      },
      {
        canAccessAt: { $lt: endDate },
      },
    ],
  })
  return { count: result }
}

/**
 * Mettre à jours le département du candidat
 * @async
 * @function
 * @param {Object} candidat - Candidat
 * @param {*} departement - departement administratif
 * @returns {Promise.<Candidat>} - Candidat mis à jour
 * */
export const updateCandidatDepartement = (candidat, departement) => {
  if (!departement) throw new Error('le département est incorrect')
  candidat.departement = departement
  return candidat.save()
}

export const findCandidatsSignIn = async (filter, options, page) => {
  const dateNow = getFrenchLuxon()
  const candidatsQuery = Candidat.find({
    ...filter,
    isValidatedByAurige: true,
    $or: [
      {
        canAccessAt: { $lt: dateNow },
      },
      {
        canAccessAt: { $exists: false },
      },
    ],
  }, options)

  if (page !== undefined) {
    candidatsQuery.skip(1000 * page).limit(1000)
  }
  const candidats = await candidatsQuery.exec()
  return candidats
}

export const totalCandidatsSignIn = async (filter) => {
  const dateNow = getFrenchLuxon()
  const count = await Candidat.countDocuments({
    ...filter,
    isValidatedByAurige: true,
    $or: [
      {
        canAccessAt: { $lt: dateNow },
      },
      {
        canAccessAt: { $exists: false },
      },
    ],
  })
  return count
}

/**
 * @typedef {Object} CandidatUpdateData
 * @property {boolean} isEvaluationDone - `true` si le candidat à rempli le questionnaire d'évaluation
 * @property {string} prenom - Prénom du candidat
 * @property {string} email - Adresse courriel du candidat
 * @property {string} portable - Numéro de téléphone mobile du candidat
 * @property {string} adresse - Adresse postale du candidat
 */

/**
 * @typedef {Object} CandidatFormData
 * @property {string} adresse - Adresse postale du candidat
 * @property {string} codeNeph - Code NEPH du candidat
 * @property {string} email - Adresse courriel du candidat
 * @property {string} emailValidationHash - Hash de validation de l'adresse courriel du candidat
 * @property {string} isValidatedEmail - Indicateur de l'état de validation de l'adresse courriel du candidat
 * @property {string} nomNaissance - Nom de naissance du candidat
 * @property {string} portable - Numéro de téléphone mobile du candidat
 * @property {string} prenom - Prénom du candidat
 * @property {string} departement - Département du candidat
 */
