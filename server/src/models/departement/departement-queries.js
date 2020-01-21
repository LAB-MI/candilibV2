/**
 * Ensemble des actions sur les départements dans la base de données
 * @module
 *
 */

import Departement from './departement-model'

/**
 * Crée un département
 *
 * @async
 * @function
 *
 * @param {Object} param
 * @param {string} param._id - Identifiant du département
 * @param {string} param.email - Adresse courriel du département
 *
 * @returns {Promise.<Departement~DepartementMongooseDocument>} - Le département créé
 */
export const createDepartement = async ({ _id, email }) => {
  const departement = new Departement({
    _id,
    email,
  })
  await departement.save()
  return departement
}

/**
 * Renvoie le département par la recherche avec son id
 *
 * @async
 * @function
 *
 * @param {string} _id - Identifiant du département
 *
 * @returns {Promise.<Departement~DepartementMongooseDocument | null>} - Le département trouvé le cas échéant
 */
export const findDepartementById = async _id => Departement.findById(_id)

/**
 * Renvoie le département par la recherche avec son adresse courriel
 *
 * @async
 * @function
 *
 * @param {Object} email - Adresse courriel du département
 *
 * @returns {Promise.<Departement>}
 */

export const findDepartementByEmail = async email =>
  Departement.findOne({ email })

/**
 * Vérifie si le departement existe, et renvoie `true` si c'est le cas, `false` sinon
 *
 * @async
 * @function
 *
 * @param {string} _id - Identifiant du département à trouver dans la base de données
 *
 * @returns {Promise.<boolean>} - `true` si un département existe avec cet identifiant
 */
export const isDepartementExisting = async _id => {
  const isExist = await Departement.exists({ _id })
  return isExist
}

/**
 * Supprime le département par la recherche avec son id
 *
 * @async
 * @function
 *
 * @param {string} _id - Identifiant du département
 *
 * @returns {Promise.<Departement~DepartementMongooseDocument>} - Le département supprimé
 */
export const deleteDepartementById = async _id => {
  const departement = await findDepartementById(_id)
  if (!departement) {
    throw new Error(`No departement found with this id: ${_id}`)
  }
  await departement.delete()
  return departement
}

/**
 * Cherche tous les départements
 *
 * @async
 * @function
 *
 * @returns {Promise.<Departement~DepartementMongooseDocument[]>} - Les départements trouvés
 */
export const findAllDepartements = async () => Departement.find({}, '-__v')

/**
 * Modifie un département
 *
 * @async
 * @function
 *
 * @param {Object} param
 * @param {string} param._id - Identifiant du département
 * @param {string} param.email - Adresse courriel du département
 *
 * @returns {Promise.<Departement~DepartementMongooseDocument>} - Le département modifié
 */
export const updateDepartementById = async ({ _id, email }) => {
  const departement = await findDepartementById(_id)
  if (!departement) {
    throw new Error(`No departement found with this id: ${_id}`)
  }
  departement.email = email
  const updatedDepartement = await departement.save()
  return updatedDepartement
}
export const findDepartements = async () => Departement.find({}, '_id')
export const findAllDepartementsId = async () => Departement.find({}, '_id')
