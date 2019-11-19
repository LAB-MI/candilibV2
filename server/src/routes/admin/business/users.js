import { findUserById, findAllUsers } from '../../../models/user'
import config from '../../../config'
import { INCORRECT_DEPARTEMENT_LIST, CANNOT_ACTION_USER } from '../message.constants'

/**
 * Récupère les utilisateurs en fonction de son statut et de ses départements d'intervention
 *
 * @async
 * @function
 *
 * @param {string} userId - ID de l'utilisateur qui demande la liste des utilisateurs
 *
 * @returns {Promise.<import('../../../models/user/user.model.js').User[]>}
 */
export const getAppropriateUsers = async (userId) => {
  const user = await findUserById(userId)
  const status = user.status
  const departements = user.departements

  if (status === config.userStatuses.ADMIN) {
    const users = await findAllUsers()
    return users
  }

  const forbiddenMessage = isForbiddenToUpsertUser(status, user, departements)
  if (forbiddenMessage) {
    const error = new Error(forbiddenMessage)
    error.status = 401
    throw error
  }
}

/**
 * Détermine si un utilisateur (`user`) a le droit de modifier les données d'un
 * utilisateur d'un niveau donné (`status`)
 *
 * @function
 *
 * @param {string} status - Utilisateur dont les données sont à modifier
 * @param {import('../../../models/user/user.model.js').User} user - Utilisateur exécutant l'action
 * @param {string[]} departements - Liste des départements d'intervention de l'utilisateur
 *
 * @returns {boolean | string} - `false` si l'utilisateur peut faire la modification, sinon `string` contenant le message d'erreur
 */
export function isForbiddenToUpsertUser (status, user, departements) {
  const creatorDepartements = user.departements
  if (
    !departements ||
    !Array.isArray(departements) ||
    !departements.every(departement =>
      creatorDepartements.includes(departement)
    )
  ) {
    return INCORRECT_DEPARTEMENT_LIST
  }

  if (
    user.status === config.userStatuses.DELEGUE &&
    status === config.userStatuses.REPARTITEUR
  ) {
    return false
  }

  if (
    user.status === config.userStatuses.ADMIN &&
    (status === config.userStatuses.DELEGUE ||
      status === config.userStatuses.REPARTITEUR)
  ) {
    return false
  }

  return CANNOT_ACTION_USER
}
