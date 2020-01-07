/**
 * Module regroupant les queries sur les centres
 *
 * @module
 */

import Centre from './centre-model'

const caseInsensitive = nom => ({
  $regex: new RegExp('^' + nom.toLowerCase(), 'i'),
})

/**
 * Retourne tous les centres présents dans la base de données
 *
 * @async
 * @function
 *
 * @param {string[]} departements - Liste des départements pour filtrer les centres
 * @returns {Promise.<CentreMongooseDocument[]>} Liste des centres
 */
export const findAllCentres = async departements => {
  const centres = await Centre.find(
    departements ? { departement: { $in: departements } } : {}
  )
  return centres
}

/**
 * Retourne tous les centres présents dans la base de données
 * n'ayant pas le statut `active: false`
 *
 * @async
 * @function
 *
 * @returns {Promise.<CentreMongooseDocument[]>} Liste des centres
 */
export const findAllActiveCentres = async () => {
  const centres = await Centre.find({ active: { $ne: false } })
  return centres
}

/**
 * Retourne un centre à partir de son nom
 *
 * @async
 * @function
 *
 * @deprecated nom n'est pas unique. A remplacer par findCentreByNameAndDepartement
 * @param {string} nom - Nom du centre
 * @returns {Promise.<CentreMongooseDocument>} Centre correspondant
 */
export const findCentreByName = async nom => {
  const centre = await Centre.findOne({
    nom: caseInsensitive(nom),
    active: { $ne: false },
  })
  return centre
}

/**
 * Crée un centre dans la base de données
 *
 * @async
 * @function
 *
 * @param {string} nom - Nom du centre (de la ville du centre)
 * @param {string} label - Information complémentaire pour retrouver le point de rencontre du centre
 * @param {string} adresse - Adresse du centre
 * @param {number} lon - Longitude géographique du centre
 * @param {number} lat - Latitude géographique du centre
 * @param {string} departement - Département du centre
 * @returns {Promise.<CentreMongooseDocument>} Centre créé
 */
export const createCentre = async (
  nom,
  label,
  adresse,
  lon,
  lat,
  departement
) => {
  const geoloc = {
    type: 'Point',
    coordinates: [lon, lat],
  }
  const centre = new Centre({
    nom,
    label,
    adresse,
    geoloc,
    departement,
    active: true,
  })
  await centre.save()
  return centre
}

/**
 * Supprime un centre de la base de données
 *
 * @async
 * @function
 *
 * @param {CentreMongooseDocument} centre - Le centre à supprimer
 * @returns {Promise.<CentreMongooseDocument>} Le centre supprimé
 */
export const deleteCentre = async centre => {
  if (!centre) {
    throw new Error('No centre given')
  }
  await centre.delete()
  return centre
}

/**
 * Active ou désactive la visibilitée d'un centre
 *
 * @async
 * @function
 *
 * @param {CentreMongooseDocument} centre - Le centre à modifier
 * @param {boolean} active - L'état dans lequel mettre le centre
 * @param {string} email - Adresse couriel de l'utilisateur à l'origine de la modification
 */
export const updateCentreActiveState = async (centre, active, email) => {
  if (!centre) {
    throw new Error('No centre given')
  }
  centre.active = active
  if (!active && email) {
    centre.disabledBy = email
    centre.disabledAt = new Date()
  }
  await centre.save()
  return centre
}

/**
 * Modifie un centre dans la base de données
 *
 * @async
 * @function
 *
 * @param {CentreMongooseDocument} centre - Le centre à modifier
 * @param {string} name - Nom du centre (de la ville du centre)
 * @param {string} label - Information complémentaire pour retrouver le point de rencontre du centre
 * @param {string} adresse - Adresse du centre
 * @param {string} lon - Longitude géographique du centre
 * @param {string} lat - Latitude géographique du centre
 * @returns {Promise.<CentreMongooseDocument>} Centre modifié
 */
export const updateCentreLabel = async (
  centre,
  name,
  label,
  adresse,
  lon,
  lat
) => {
  if (!centre) {
    throw new Error('centre is undefined')
  }
  await centre.updateOne({ nom: name, label, adresse, lon, lat })
  const updatedCentre = await Centre.findById(centre._id)
  return updatedCentre
}

/**
 * Récupère les centres actifs d'un département
 *
 * @async
 * @function
 *
 * @param {string} departement - Département dont les centres seront récupérés
 * @param {Object} options - Objet contenant des options pour la requête
 *
 * @returns {Promise.<CentreMongooseDocument[]>} Liste des centres trouvés
 */
export const findCentresByDepartement = async (
  departementId,
  options = '-__v'
) => {
  const filters = {
    active: { $ne: false },
  }

  if (departementId) {
    filters.departement = departementId
  }

  const centres = await Centre.find(filters, options)

  return centres
}

/**
 * Récupère un centre actif par son nom et son département
 *
 * @async
 * @function
 *
 * @param {string} nom - Nom du centre
 * @param {string} departement - Département du centre
 * @returns {Promise.<CentreMongooseDocument>} Centre correspondant
 */
export const findCentreByNameAndDepartement = async (nom, departement) => {
  const centre = await Centre.findOne({
    nom: caseInsensitive(nom),
    departement,
    active: { $ne: false },
  })
  return centre
}

/**
 * Récupère un centre actif par son id
 *
 * @async
 * @function
 *
 * @param {string} id - Id du centre
 * @returns {Promise.<CentreMongooseDocument>} Centre correspondant
 */
export const findCentreById = async id => {
  const centre = await Centre.findById(id)
  return centre
}

/**
 * Retourne la liste des départements possédant des centres
 * @async
 * @function
 *
 * @returns {Promise.<string[]>} Liste des identifiants des départements
 */
export const getDepartementsFromCentres = async () => {
  const departements = await Centre.distinct('departement')
  return departements
}
