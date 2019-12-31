// TODO: JSDOC
/**
 * Contrôleur regroupant les fonctions d'actions sur les départements
 * @module routes/admin/departement-business
 */

import {
  createDepartement,
  deleteDepartementById,
  findAllDepartement,
  findDepartementById,
  updateDepartementById,
} from '../../models/departement'

import { updateManyUser } from '../../models/user'

import config from '../../config'

export const updateDepartementsUsersAdminAndTech = async departementId => {
  const inValue = [config.userStatuses.ADMIN, config.userStatuses.TECH]
  const filterBy = 'status'
  const updatedResult = await updateManyUser(
    {
      filterBy,
      inValue,
    },
    {
      $addToSet: { departements: [`${departementId}`] },
    }
  )

  if (updatedResult.ok) {
    return true
  }
  return false
}

export const isDepartementAlreadyExist = async departementId => {
  const isDepartementAlreadyExist = await findDepartementById(departementId)

  if (isDepartementAlreadyExist) {
    return true
  }
  return false
}
/**
 * Crée un département
 * @async
 * @function
 *
 * @param {string} departementId Une chaîne de caractères correspondant à l'ID du département
 * @param {string} departementEmail Une chaîne de caractères correspondant à l'adresse courriel du département
 */
export const createDepartements = async (departementId, email) => {
  const result = await createDepartement({ _id: departementId, email })
  return result
}

/**
 * Récupère les informations d'un ou plusieurs départements
 * @async
 * @function
 *
 * @param {string} departementId Une chaîne de caractères correspondant à l'ID du département
 */
export const getDepartements = async departementId => {
  if (departementId) {
    const result = await findDepartementById(departementId)
    return result
  }
  const result = await findAllDepartement()
  return result
}

/**
 * Met à jours les informations d'un département
 * @async
 * @function
 *
 * @param {object} departement Contient toute les information du département
 */
export const updateDepartements = async departement => {
  const result = await updateDepartementById(departement)
  return result
}

/**
 * Récupère les informations d'un ou plusieurs départements
 * @async
 * @function
 *
 * @param {string} departementId Une chaîne de caractères correspondant à l'ID du département
 */
export const deleteDepartement = async departementId => {
  const result = await deleteDepartementById(departementId)
  return result
}
