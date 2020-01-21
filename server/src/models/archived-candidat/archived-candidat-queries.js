/**
 * Ensemble des actions sur les candidats archivés dans la base de données
 * @module
 */
import ArchivedCandidat from './archived-candidat-model'
import Place from '../place/place-model'
import moment from 'moment'

/**
 * Création d'un document archived-candidat
 * @async
 * @function
 *
 * @param {Promise.<ArchivedCandidat~ArchivedCandidatMongooseDocument>} candidatData Candidat à archiver
 * @returns {Promise.<ArchivedCandidat~ArchivedCandidatMongooseDocument>}
 */
export const createArchivedCandidat = async candidatData => {
  const archivedCandidat = await ArchivedCandidat.create(candidatData)
  return archivedCandidat
}

/**
 * Compte les candidats archivés
  * @async
 * @function
 *
 * @returns {Promise.<number>} - Nombre de candidats archivés
 */
export const countArchivedCandidats = async () =>
  ArchivedCandidat.countDocuments()

/**
 * Renvoie la liste de tous les candidats archivés sous forme d'objets non attachés à mongoose
 *
 * @async
 * @function
 *
 * @returns {Promise.<ArchivedCandidat~ArchivedCandidatMongooseLeanDocument>}
 */
export const findAllArchivedCandidatsLean = async (limit = 20, skip = 0) => {
  const candidats = await ArchivedCandidat.find({}, null, {
    limit,
    skip,
  }).lean()
  return candidats
}

/**
 * Renvoie un candidat archivé par son adresse courriel
 *
 * @async
 * @function
 *
 * @param {string} email - Adresse courriel du candidat archivé
 *
 * @returns {Promise.<ArchivedCandidat~ArchivedCandidatMongooseDocument>}
 */
export const findArchivedCandidatByEmail = async email => {
  const archivedCandidat = await ArchivedCandidat.findOne({ email })
  return archivedCandidat
}

/**
 * Renvoie un candidat archivé par son id
 *
 * @async
 * @function
 *
 * @param {string} id - Identitifiant du candidat archivé
 * @param {string} options - Options mongoose pour la query de recherche candidat archivé
 *
 * @returns {Promise.<ArchivedCandidat~ArchivedCandidatMongooseDocument>}
 */
export const findArchivedCandidatById = async (id, options) => {
  const archivedCandidat = await ArchivedCandidat.findById(id, options)
  return archivedCandidat
}

export const findActiveArchivedCandidatByEmail = async email => {
  const candidat = await ArchivedCandidat.findOne({
    email,
    archived: undefined,
  })
  return candidat
}

/**
 * Renvoie un candidat archivé par son nom et son code NEPH
 *
 * @async
 * @function
 *
 * @param {string} nomNaissance - Nom de naissance du candidat archivé
 * @param {string} codeNeph - NEPH du candidat archivé
 *
 * @returns {Promise.<ArchivedCandidat~ArchivedCandidatMongooseDocument>}
 */
export const findArchivedCandidatByNomNeph = async (nomNaissance, codeNeph) => {
  const archivedCandidat = await ArchivedCandidat.findOne({ nomNaissance, codeNeph })
  return archivedCandidat
}

export const findArchivedCandidatByNomNephFullText = async $search => {
  const candidat = await ArchivedCandidat.find(
    { $text: { $search } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } })
  return candidat
}

/**
 * Supprime le candidat archivé trouvé par son nom de naissance et son code NEPH (passés en paramètres)
 * de la base de données, et le renvoie
 *
 * @async
 * @function
 *
 * @param {string} nomNaissance - Nom de naissance du candidat archivé
 * @param {string} codeNeph - Code NEPH du candidat archivé
 * @param {string} reason - Raison de l'archivage du candidat archivé
 *
 * @returns {Promise.<ArchivedCandidat~ArchivedCandidatMongooseDocument>}
 */
export const deleteArchivedCandidatByNomNeph = async (
  nomNaissance,
  codeNeph
) => {
  const archivedCandidat = await ArchivedCandidat.findOne({ nomNaissance, codeNeph })
  if (!archivedCandidat) {
    throw new Error('No candidat found')
  }
  await archivedCandidat.delete()
  return archivedCandidat
}

/**
 * Supprime le candidat archivé
 *
 * @async
 * @function
 *
 * @param {ArchivedCandidat~ArchivedCandidatMongooseDocumen} archivedCandidat - Candidat archivé
 *
 * @returns {Promise.<ArchivedCandidat~ArchivedCandidatMongooseDocument>}
 */
export const deleteArchivedCandidat = async archivedCandidat => {
  if (!archivedCandidat) {
    throw new Error('No candidat given')
  }
  await archivedCandidat.delete()
  return archivedCandidat
}

/**
 * Met à jour l'adresse courriel du candidat archivé et le renvoi
 *
 * @async
 * @function
 *
 * @param {ArchivedCandidat~ArchivedCandidatMongooseDocumen} archivedCandidat - Candidat archivé
 * @param {string} email - Adresse courriel du candidat
 *
 * @returns {Promise.<ArchivedCandidat~ArchivedCandidatMongooseDocument>}
 */
export const updateArchivedCandidatEmail = (archivedCandidat, email) => {
  if (!archivedCandidat) {
    throw new Error('candidat is undefined')
  }
  archivedCandidat.email = email
  return archivedCandidat.save()
}

/**
 * Renvoie les candidats archivés qui ont réservé une place d'examen un jour donné (date passé en paramètre)
 *
 * @async
 * @function
 *
 * @param {string} date - Date du jour de l'examen au format ISO
 * @param {string} inspecteur - Identifiant de l'inspecteur
 * @param {string} centre - Identifiant du centre d'examen
 *
 * @returns {Promise.<ArchivedCandidat~ArchivedCandidatMongooseDocument>} Liste des candidats archivé ayant réservé ce jour avec cet inspecteur dans ce centre
 */
export const findBookedArchivedCandidats = async (date, inspecteur, centre) => {
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

  if (inspecteur && inspecteur.trim().length > 0) {
    query = query.where('inspecteur', inspecteur)
  }
  if (centre && centre.trim().length > 0) query = query.where('centre', centre)

  const places = await query.exec()
  if (places) {
    const candidats = await Promise.all(
      places.map(async place => {
        const { candidat: id } = place
        const candidat = await ArchivedCandidat.findById(id)
        if (!candidat) return {}
        candidat.place = place
        return candidat
      })
    )
    return candidats
  }
  return null
}

export const updateArchivedCandidatSignUp = (candidat, data) => {
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

export const updateArchivedCandidatById = async (id, updatedData) => {
  const updateInfo = await ArchivedCandidat.findByIdAndUpdate(id, updatedData)
  return updateInfo
}
