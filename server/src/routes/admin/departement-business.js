/**
 * Fonctions métiers pour la gestion des départements
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
import { findCentresByDepartement } from '../../models/centre'

import config from '../../config'

export const updateDepartementsUsersAdminAndTech = async departementId => {
  const usersStatus = [config.userStatuses.ADMIN, config.userStatuses.TECH]

  const updatedResult = await updateManyUser(
    {
      status: {
        $in: usersStatus,
      },
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

export const removeDepartementOfUsersByStatus = async (
  departementId,
  userStatus
) => {
  const updatedResult = await updateManyUser(
    {
      status: {
        $in: userStatus,
      },
    },
    {
      $pull: { departements: `${departementId}` },
    }
  )

  if (updatedResult.ok) {
    return true
  }
  return false
}

export const isContainingCentre = async departementId => {
  const foundedCentre = await findCentresByDepartement(departementId, {})

  if (foundedCentre.length) {
    return true
  }
  return false
}

export const isDepartementAlreadyExist = async departementId => {
  const departement = await findDepartementById(departementId)
  return !!departement
}

/**
 * Crée un département
 * @async
 * @function
 *
 * @param {string} departementId ID du département
 * @param {string} departementEmail Adresse courriel du département
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
 * @param {string} departementId ID du département
 * @returns {Promise.<Departement | Departement[]>} Si le departementId n'est pas renseigné, la fonction retourne tous les départements
 */
export const getDepartements = departementId => {
  if (departementId) {
    return findDepartementById(departementId)
  }
  return findAllDepartement()
}

/**
 * Met à jour les informations d'un département
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
 * @param {string} departementId ID du département
 */
export const deleteDepartement = async departementId => {
  const result = await deleteDepartementById(departementId)
  return result
}
