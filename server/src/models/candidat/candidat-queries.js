/**
 * Ensemble des actions sur les candidats dans la base de données
 * @module
 *
 */

import moment from 'moment'

import ArchivedCandidat from '../archived-candidat/archived-candidat-model'
import Candidat from './candidat-model'
import Place from '../place/place-model'
import { getFrenchLuxon, techLogger } from '../../util'

/**
 * Crée un candidat
 *
 * @async
 * @function
 *
 * @param {CandidatFormData}
 *
 * @returns {Promise.<Candidat~CandidatMongooseDocument>}
 */
export const createCandidat = async ({
  adresse,
  codeNeph,
  email,
  emailValidationHash,
  isValidatedEmail,
  nomNaissance,
  portable,
  prenom,
  departement,
}) => {
  const candidat = new Candidat({
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
  })
  await candidat.save()
  return candidat
}

/**
 * Renvoie la liste de tous les candidats sous forme d'objets non attachés à mongoose
 *
 * @async
 * @function
 *
 * @returns {Promise.<Candidat~CandidatMongooseLeanDocument>}
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
 * @param {string} email - Adresse courriel du candidat
 *
 * @returns {Promise.<Candidat~CandidatMongooseDocument>}
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument>}
 */
export const findCandidatById = async (id, options) => {
  if (options && options.dateDernierEchecPratique) {
    options.noReussites = 1
  }
  const candidat = await Candidat.findById(id, options)
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument[]>}
 */
export const findCandidatsMatching = async (
  $search,
  startingWith,
  endingWith
) => {
  const search = `${startingWith ? '^' : ''}${$search}${endingWith ? '$' : ''}`
  const searchRegex = new RegExp(`${search}`, 'i')

  const candidats = await Candidat.find({
    $or: [
      { nomNaissance: searchRegex },
      { prenom: searchRegex },
      { codeNeph: searchRegex },
      { email: searchRegex },
    ],
  })
  const fullTextCandidats = await Candidat.find(
    { $text: { $search } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } })

  return [
    ...candidats,
    ...fullTextCandidats.filter(
      candidat =>
        !candidats.some(cand => cand._id.toString() === candidat._id.toString())
    ),
  ]
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument>}
 */
export const findCandidatByNomNeph = async (nomNaissance, codeNeph) => {
  const candidat = await Candidat.findOne({ nomNaissance, codeNeph })
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument>}
 */
export const deleteCandidatByNomNeph = async (
  nomNaissance,
  codeNeph,
  reason
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
 * @param {Candidat~CandidatMongooseDocument} candidat - Candidat
 * @param {string} reason - Raison de l'archivage du candidat
 *
 * @returns {Promise.<Candidat~CandidatMongooseDocument>}
 */
export const deleteCandidat = async (candidat, reason) => {
  if (!candidat) {
    throw new Error('No candidat given')
  }
  try {
    const cleanedCandidat = candidat.toObject ? candidat.toObject() : candidat
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument>}
 */
export const updateCandidatEmail = (candidat, email) => {
  if (!candidat) {
    throw new Error('candidat is undefined')
  }
  candidat.email = email
  return candidat.save()
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument[]>} Liste des candidats ayant réservé ce jour avec cet inspecteur dans ce centre
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
      })
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument>}
 */
export const updateCandidatSignUp = (candidat, data) => {
  const { prenom, email, portable, adresse } = data

  if (!candidat) {
    throw new Error('candidat is undefined')
  }
  candidat.prenom = prenom
  candidat.email = email
  candidat.portable = portable
  candidat.adresse = adresse
  return candidat.save()
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument>}
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument>}
 */
export const updateCandidatCanBookFrom = async (candidat, canBookFrom) => {
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument>}
 */
export const setCandidatFirstConnection = async id => {
  const candidat = await findCandidatById(id)
  if (!candidat.firstConnection) {
    candidat.firstConnection = new Date()
    return candidat.save()
  }
  return candidat
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument>} - Candidat
 */
export const addPlaceToArchive = (
  candidat,
  place,
  reason,
  byUser,
  isCandilib
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument>} - Candidat avec la nouvelle place archivée
 */
export const archivePlace = async (
  candidat,
  place,
  reason,
  byUser,
  isCandilib
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument>} - Candidat mis à jour après une non réussite
 */
export const updateCandidatFailed = async (
  candidat,
  { dateDernierEchecPratique, canBookFrom }
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument>}
 */
export const updateCandidatNoReussite = async (
  candidat,
  { lastNoReussite, canBookFrom }
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
 * @returns {Promise.<Candidat~CandidatMongooseDocument>} - Candidat mis à jour
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
  const isExist = await Candidat.exists({ _id })
  return isExist
}

/**
 * Compte les candidats inscrits dans un département
 *
 * @async
 * @function
 *
 * @param {string} departement - Id du département
 *
 * @returns {Promise.<number>} - Nombre de candidats inscrits dans le département
 */
export const countCandidatsInscritsByDepartement = async departement => {
  return Candidat.countDocuments({
    departement,
    isValidatedByAurige: true,
  })
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
