/**
 * Gestion des utilisateurs (Admin, répartiteurs et délégués)
 * @module
 */

import {
  findUserById,
  findAllActiveUsers,
  createUser,
  findUserByEmail,
  updateUser,
  archiveUserByEmail,
} from '../../../models/user'
import config from '../../../config'
import { email as regexEmail } from '../../../util'
import {
  INCORRECT_DEPARTEMENT_LIST,
  CANNOT_ACTION_USER,
  INVALID_EMAIL,
  INVALID_DEPARTEMENTS_LIST,
} from '../message.constants'
import { createPassword } from '../../../util/password'

/**
 * Vérifie qu'une liste est bien un tableau non vide
 *
 * @param {any[]} list - Liste d'éléments
 *
 * @return {boolean} - True si la liste est "falsy" ou n'est pas un tableau
 *                     ou un tableau vide
 */
const isInvalidList = list => !list || !Array.isArray(list) || !list.length

/**
 * Récupère les utilisateurs en fonction de leur statut et de leurs départements
 *
 * @async
 * @function
 *
 * @param {string} userId - ID de l'utilisateur qui demande la liste des utilisateurs
 *
 * @returns {Promise.<import('../../../models/user/user.model.js').User[]>}
 */

export const getAppropriateUsers = async userId => {
  const user = await findUserById(userId)
  const status = user.status

  const isAdmin = status === config.userStatuses.ADMIN
  const isDelegue = status === config.userStatuses.DELEGUE
  const departements = isAdmin ? undefined : user.departements
  const maxStatus = config.userStatusesOrderedList.findIndex(
    stat => stat === status,
  )
  const allowedStatuses = config.userStatusesOrderedList.slice(0, maxStatus)

  if (!isAdmin && !isDelegue) {
    const error = new Error(
      "Vous n'êtes pas autorisé à accéder à cette ressource",
    )
    error.status = 401
    throw error
  }

  const users = await findAllActiveUsers(departements, allowedStatuses)
  return users
}

/**
 * Crée un utilisateur
 *
 * @async
 * @function
 *
 * @param {string} userId - ID de l'utilisateur qui crée l' utilisateur
 * @param {string} email - Adresse courriel de l'utilisateur créé
 * @param {string} status - Statut de l'utilisateur créé
 * @param {string[]} departements - Départements d'intervention de l'utilisateur créé
 *
 * @returns {Promise.<UserMongooseDocument[]>}
 */
export const createAppropriateUser = async (
  userId,
  email,
  status,
  departements,
) => {
  const isValidEmail = regexEmail.test(email)
  if (!isValidEmail) {
    const error = new Error(INVALID_EMAIL)
    error.status = 400
    throw error
  }

  if (isInvalidList(departements)) {
    const error = new Error(INVALID_DEPARTEMENTS_LIST)
    error.status = 400
    throw error
  }

  const user = await findUserById(userId)

  const forbiddenMessage = isForbiddenToUpsertUser(status, user, departements)

  if (forbiddenMessage) {
    const error = new Error(forbiddenMessage)
    error.status = 401
    throw error
  }

  const password = createPassword()
  const savedUser = await createUser(email, password, departements, status)
  return savedUser
}

/**
 * Modifie le statut et le départements d'un utilisateur
 *
 * @async
 * @function
 *
 * @param {string} userId - ID de l'utilisateur qui modifie l'utilisateur
 * @param {string} email - Adresse courriel de l'utilisateur à modifier
 * @param {Object} param - Objet contenant le statut et les départements
 * @param {string} param.status - Statut de l'utilisateur à modifier
 * @param {string[]} param.departements - Département de l'utilisateur à modifier
 *
 * @returns {Promise.<import('../../../models/user/user.model.js').User[]>}
 */
export const updateUserBusiness = async (
  userId,
  email,
  status,
  departements,
) => {
  const isValidEmail = regexEmail.test(email)
  if (!isValidEmail) {
    const error = new Error(INVALID_EMAIL)
    error.status = 400
    throw error
  }

  if (isInvalidList(departements)) {
    const error = new Error(INVALID_DEPARTEMENTS_LIST)
    error.status = 400
    throw error
  }

  const user = await findUserById(userId)
  const userToUpdate = await findUserByEmail(email)

  if (!userToUpdate) {
    const message = "Cet utilisateur n'existe pas"
    const error = new Error(message)
    error.status = 404
    throw error
  }

  const isForbiddenMessage =
    isForbiddenToUpsertUser(status, user, departements) ||
    isForbiddenToUpsertUser(
      userToUpdate.status,
      user,
      userToUpdate.departements,
    )
  if (isForbiddenMessage) {
    const error = new Error(isForbiddenMessage)
    error.status = 401
    throw error
  }

  const updatedUser = await updateUser(email, { status, departements })

  return updatedUser
}

export const archiveUserBusiness = async (userId, emailToDelete) => {
  const isValidEmail = regexEmail.test(emailToDelete)
  if (!isValidEmail) {
    const error = new Error(INVALID_EMAIL)
    error.status = 400
    throw error
  }
  const user = await findUserById(userId)
  const userToDelete = await findUserByEmail(emailToDelete)

  if (!userToDelete) {
    const message = "Cet utilisateur n'existe pas"
    const error = new Error(message)
    error.status = 404
    throw error
  }

  if (userToDelete.deletedAt) {
    const message = 'Cet utilisateur est déjà archivé'
    const error = new Error(message)
    error.status = 409
    throw error
  }

  const isForbiddenMessage = isForbiddenToUpsertUser(
    userToDelete.status,
    user,
    userToDelete.departements,
  )

  if (isForbiddenMessage) {
    const error = new Error(isForbiddenMessage)
    error.status = 401
    throw error
  }

  const deletedUser = archiveUserByEmail(emailToDelete, user.email)

  return deletedUser
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
  const authorizedDepartements = user.departements
  if (
    !departements.every(departement =>
      authorizedDepartements.includes(departement),
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
