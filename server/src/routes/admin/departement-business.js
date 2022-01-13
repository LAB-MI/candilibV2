/**
 * Fonctions métiers pour la gestion des départements
 *
 * @module routes/admin/departement-business
 */

import {
  createDepartement,
  deleteDepartementById,
  findAllDepartements,
  findDepartementById,
  findDepartementByEmail,
  updateDepartementById,
} from '../../models/departement'

import { updateManyUser } from '../../models/user'
import { findCentresByDepartement } from '../../models/centre'

import config from '../../config'
import { getFrenchLuxonFromISO } from '../../util'
import { sendMessageIPC } from '../../util/pm2-util'

/**
 * Met à jour les départements de chaque utilisateur ayant les statut admin et tech
 *
 * @async
 * @function
 *
 * @param {string} departementId - Identifiant du département
 * @returns {boolean} - Retourne `true` si le département a bien été mis à jour pour chaque users, sinon `false`
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
    },
  )

  if (updatedResult.ok) {
    return true
  }
  return false
}

/**
 * Supprime le département de chaque utilisateur du statut en paramètre
 *
 * @async
 * @function
 *
 * @param {string} departementId - Identifiant du département
 * @param {array} userStatus - Liste des statut de user
 * @returns {boolean} - Retourne `true` si le département a bien été supprimé des users, sinon `false`
 */
export const removeDepartementOfUsersByStatus = async (
  departementId,
  userStatus,
) => {
  const updatedResult = await updateManyUser(
    {
      status: {
        $in: userStatus,
      },
    },
    {
      $pull: { departements: `${departementId}` },
    },
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
 * @param {string} departementId - Identifiant du département
 * @returns {boolean} - Retourne `true` si le département est lié à un centre, sinon `false`
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
 * @param {string} departementEmail - Adresse courriel du département
 * @returns {boolean} - Retourne `true` si le département avec cette adresse courriel existe déjà, sinon `false`
 */
export const isEmailAlreadyUse = async (departementEmail, departementId) => {
  const departement = await findDepartementByEmail(departementEmail)
  return !!(departement && departement._id !== departementId)
}

/**
 * Vérifie si le département existe déjà
 *
 * @async
 * @function
 *
 * @param {string} departementId - Identifiant du département
 * @returns {boolean} - Retourne `true` si le département existe déjà, sinon `false`
 */
export const isDepartementAlreadyExist = async departementId => {
  const departement = await findDepartementById(departementId)
  return !!departement
}

/**
 * Crée un département
 *
 * @async
 * @function
 *
 * @param {string} departementId - Identifiant du département
 * @param {string} departementEmail - Adresse courriel du département
 *
 * @returns {Promise.<Departement>} - Retourne le département créé
 */
export const createDepartements = async (departementId, email, isAddedRecently) => {
  const result = await createDepartement({ _id: departementId, email, isAddedRecently })
  return result
}

/**
 * Récupère les informations d'un ou plusieurs départements
 *
 * @async
 * @function
 *
 * @param {string} departementId - Identifiant du département
 * @returns {Promise.<Departement | Departement[]>} - Si le departementId n'est pas renseigné, la fonction retourne tous les départements
 */
export const getDepartements = departementId => {
  if (departementId) {
    return findDepartementById(departementId)
  }
  return findAllDepartements()
}

/**
 * Met à jour les informations d'un département
 *
 * @async
 * @function
 *
 * @param {object} departement - Contient toute les information du département
 */
export const updateDepartements = async (departement, disableAt) => {
  if (disableAt !== undefined) {
    const tmpDisableAt = getFrenchLuxonFromISO(disableAt)
    departement.disableAt = tmpDisableAt.isValid ? tmpDisableAt : null
  }
  const result = await updateDepartementById(departement)
  sendMessageIPC('INIT_CACHE_DEPARTEMENT_INFOS')
  return result
}

/**
 * Récupère les informations d'un ou plusieurs départements
 *
 * @async
 * @function
 *
 * @param {string} departementId - Identifiant du département
 */
export const deleteDepartement = async departementId => {
  const result = await deleteDepartementById(departementId)
  return result
}
