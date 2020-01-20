import Departement from './departement.model'

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
 * @returns {Promise.<DepartementMongooseDocument>} - Le département créé
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
 * Cherche un département à partir de son identifiant
 *
 * @async
 * @function
 *
 * @param {string} _id - Identifiant du département
 *
 * @returns {Promise.<DepartementMongooseDocument | null>} - Le département trouvé le cas échéant
 */
export const findDepartementById = async _id => Departement.findById(_id)

export const findDepartementsByEmail = async email =>
  Departement.find({ email })

/**
 * Supprime un département
 *
 * @async
 * @function
 *
 * @param {string} _id - Identifiant du département
 *
 * @returns {Promise.<DepartementMongooseDocument>} - Le département supprimé
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
 * @returns {Promise.<DepartementMongooseDocument[]>} - Les départements trouvés
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
 * @returns {Promise.<DepartementMongooseDocument>} - Le département modifié
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
