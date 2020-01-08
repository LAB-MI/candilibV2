/**
 * Fonctions métiers pour la gestion des départements
 * @module routes/admin/departement-business
 */

import {
  createDepartement,
  deleteDepartementById,
  findAllDepartements,
  findDepartementById,
  findDepartementsByEmail,
  updateDepartementById,
} from '../../models/departement'

import { updateManyUser } from '../../models/user'
import { findCentresByDepartement } from '../../models/centre'

import config from '../../config'

/**
 * Mes à jour les départements de chaque utilisateur ayant les status admin et tech
 *
 * @async
 * @function
 *
 * @param {string} departementId Identifiant du département
 * @returns {boolean} retourne `true` si le département a bien été mis à jour pour chaque users, sinon `false`
 */
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

/**
 * Supprime le département de chaque utilisateur du status en paramètre
 *
 * @async
 * @function
 *
 * @param {string} departementId Identifiant du département
 * @param {array} userStatus list des status de user
 * @returns {boolean} retourne `true` si le département a bien été supprimer des users, sinon `false`
 */
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

/**
 * Vérifie si un département est lié à un centre
 *
 * @async
 * @function
 *
 * @param {string} departementId Identifiant du département
 * @returns {boolean} retourne `true` si le département est lié à un centre, sinon `false`
 */
export const isContainingCentre = async departementId => {
  const foundedCentre = await findCentresByDepartement(departementId, {})

  if (foundedCentre.length) {
    return true
  }
  return false
}

/**
 * Vérifie si un département avec cette adresse courriel existe déjà
 *
 * @async
 * @function
 *
 * @param {string} departementEmail Adresse courriel du département
 * @returns {boolean} retourne `true` si le département avec cette adresse courriel existe déjà, sinon `false`
 */
export const isEmailAlreadyUse = async departementEmail => {
  const departements = await findDepartementsByEmail(departementEmail)
  return !!departements.length
}

/**
 * Vérifie si le département existe déjà
 *
 * @async
 * @function
 *
 * @param {string} departementId ID du département
 * @returns {boolean} retourne `true` si le département existe déjà, sinon `false`
 */
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
 *
 * @returns {Promise.<Departement>} retourne le département créé
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
  return findAllDepartements()
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
