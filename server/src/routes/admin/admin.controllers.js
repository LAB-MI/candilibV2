/**
 * Contrôleur regroupant les fonctions de récupération des infos admin
 * @module routes/admin/admin-controllers
 */
import {
  findUserById,
  createUser,
  deleteUserByEmail,
  findUserByEmail,
  updateUser,
  findAllUsers,
} from '../../models/user'
import { findDepartementById } from '../../models/departement'

import { appLogger, email as regexEmail } from '../../util'
import config from '../../config'
import { createPassword } from '../../util/password'
import { sendMailResetLink } from '../business/send-mail-reset-password'
import { sendMailConfirmationUpdateUserInfo } from '../business/send-mail-update-user-info'
import {
  CANNOT_ACTION_USER,
  INCORRECT_DEPARTEMENT_LIST,
  INVALID_EMAIL,
  USER_NO_EXIST,
} from './message.constants'

/**
 * Récupère les infos de l'admin
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId - Id de l'admin souhaitant récupérer ses informations
 * @param {import('express').Response} res
 */
export const getMe = async (req, res) => {
  const loggerInfo = {
    section: 'admin-me',
    action: 'get-me',
    admin: req.userId,
  }
  appLogger.info(loggerInfo)
  try {
    const infoAdmin = await findInfoAdminById(req.userId)
    if (infoAdmin) {
      return res.json(infoAdmin)
    }
    appLogger.warn({
      ...loggerInfo,
      description: 'Utilisateur non trouvé',
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })
  }
  res.status(401).send({
    message: 'Accès interdit',
    success: false,
  })
}

/**
 * Récupère les infos d'un admin à partir de son id
 *
 * @async
 * @function
 *
 * @param {string} userId - Id de l'admin recherché
 *
 * @returns {InfoAdmin} - Les informations de l'admin
 */
const findInfoAdminById = async userId => {
  const { email, departements, status } = await findUserById(userId)
  if (!email || !departements || !status) {
    return
  }
  const emailsDepartements = await Promise.all(
    departements.map(findDepartementById)
  )

  const features = config.userStatusFeatures[status]

  return {
    email,
    departements,
    features,
    emailsDepartements,
  }
}

/**
 * Crée un utilisateur
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId - Id de l'utilisateur souhaitant créér un délégué ou un répartiteur
 * @param {string} req.body.email - Adresse courriel de l'utilisateur créér
 * @param {string} req.body.departements - Départements de l'utilisateur créér
 * @param {string} req.body.status - Status de l'utilisateur créér
 * @param {import('express').Response} res
 */
export const createUserController = async (req, res) => {
  const { email, departements, status } = req.body
  const loggerInfo = {
    section: 'admin-create-user',
    action: 'post-user',
    admin: req.userId,
    departements,
    email,
    status,
  }

  appLogger.info(loggerInfo)

  const isValidEmail = regexEmail.test(email)
  if (!isValidEmail) {
    return res.status(400).json({
      success: false,
      message: INVALID_EMAIL,
    })
  }

  const user = await findUserById(req.userId)
  const forbiddenMessage = isForbiddenToUpsertUser(status, user, departements)
  if (forbiddenMessage) {
    res.status(401).json({
      success: false,
      message: forbiddenMessage,
    })
    return
  }

  try {
    const password = createPassword()
    await createUser(email, password, departements, status)
    await sendMailResetLink(email)
    appLogger.info({
      ...loggerInfo,
      action: 'created-user',
      description:
        "L'utilisateur a bien été créé et un courriel lui a été envoyé",
    })
    return res.status(201).json({
      success: true,
      message: `L'utilisateur a bien été créé et un courriel de mise à jour de mot passe a été envoyé à ${email}`,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: "L'utilisateur n'a pas été créé",
      error,
    })
    return res.status(error.status || 500).json({
      success: false,
      message: `Impossible de créer l'utilisateur : ${error.message}`,
    })
  }
}

/**
 * Récupere un utilisateur
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId - Id de l'utilisateur souhaitant créér un délégué ou un répartiteur
 * @param {string} req.body.email - Adresse courriel de l'utilisateur trouvé
 * @param {string} req.body.departements - Départements de l'utilisateur trouvé
 * @param {string} req.body.status - Status de l'utilisateur trouvé
 * @param {import('express').Response} res
 */
export const getUsers = async (req, res) => {
  const loggerInfo = {
    section: 'admin-get-user',
    action: 'get-user',
    admin: req.userId,
  }

  appLogger.info(loggerInfo)

  const user = await findUserById(req.userId)
  const status = user.status
  if (status === config.userStatuses.ADMIN) {
    const users = await findAllUsers()
    return res.status(200).json({ success: true, users })
  }

  // const forbiddenMessage = isForbiddenToUpsertUser(status, user, departements)
  // if (forbiddenMessage) {
  res.status(401).json({
    success: false,
    message: "Vous n'êtes pas autorisé à accéder à cette ressource", // forbiddenMessage,
  })
  // }
}

/**
 * Détermine si un utilisateur (`user`) a le droit de modifier les données d'un
 * utilisateur d'un niveau donné (`status`)
 *
 * @function
 *
 * @param {User} userToUpdate - Utilisateur dont les données sont à modifier
 * @param {User} user - Utilisateur exécutant l'action
 * @param {string[]} departements - Liste des départements d'intervention de l'utilisateur
 *
 * @returns {boolean} - `true` si l'utilisateur peut faire la modification, `false` sinon
 */
function isForbiddenToUpsertUser (status, user, departements) {
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

/**
 * Met à jour les informations de l'utilisateur
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId - Id de l'utilisateur souhaitant modifier un délégué ou un répartiteur
 * @param {string} req.body.email - Adresse courriel de l'utilisateur mis à jour
 * @param {string} req.body.departements - Départements de l'utilisateur mis à jour
 * @param {string} req.body.status - Status de l'utilisateur mis à jour
 * @param {import('express').Response} res
 */
export const updatedInfoUser = async (req, res) => {
  const { email, departements, status } = req.body
  const loggerInfo = {
    section: 'admin-update-user',
    action: 'put-user',
    admin: req.userId,
    departements,
    email,
    status,
  }

  appLogger.info(loggerInfo)

  const isValidEmail = regexEmail.test(email)
  if (!isValidEmail) {
    return res.status(400).json({
      success: false,
      message: INVALID_EMAIL,
    })
  }

  const user = await findUserById(req.userId)
  const userToUpdate = await findUserByEmail(email)

  if (!userToUpdate) {
    const message = "L'email n'existe pas"
    res.status(404).json({
      success: false,
      message,
    })
    return
  }

  const forbiddenMessage = isForbiddenToUpsertUser(status, user, departements)

  if (forbiddenMessage) {
    res.status(401).json({
      success: false,
      message: forbiddenMessage,
    })
    return
  }

  try {
    const updatedUser = await updateUser(email, { departements, status })
    await sendMailConfirmationUpdateUserInfo(email)
    return res.status(200).json({
      success: true,
      message: "Les informations de l'utilisateur ont été modifiées",
      user: updatedUser,
    })
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: `Impossible de mettre à jour l'utilisateur : ${error.message}`,
    })
  }
}

/**
 * Archiver l'utilisateur
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId - Id de l'utilisateur souhaitant supprimer un délégué ou un répartiteur
 * @param {string} req.body.email - Adresse courriel de l'utilisateur supprimer
 * @param {string} req.body.departements - Départements de l'utilisateur supprimer
 * @param {string} req.body.status - Status de l'utilisateur supprimer
 * @param {import('express').Response} res
 */
export const deleteUserController = async (req, res) => {
  const { email: emailToDelete } = req.body
  const loggerInfo = {
    section: 'admin-delete-user',
    action: 'delete-user',
    admin: req.userId,
    emailToDelete,
  }
  appLogger.info(loggerInfo)

  const user = await findUserById(req.userId)
  const userToDelete = await findUserByEmail(emailToDelete)

  if (!userToDelete) {
    res.status(400).json({
      success: false,
      message: USER_NO_EXIST,
    })
    return
  }

  const forbiddenMessage = isForbiddenToUpsertUser(
    userToDelete.status,
    user,
    userToDelete.departements
  )

  if (forbiddenMessage) {
    res.status(401).json({
      success: false,
      message: forbiddenMessage,
    })
    return
  }

  try {
    await deleteUserByEmail(emailToDelete, user.email)
    appLogger.info({
      ...loggerInfo,
      action: 'delete-user',
      description: "L'utilisateur a bien été supprimé",
    })
    return res.status(200).json({
      success: true,
      message: "L'utilisateur a bien été supprimé",
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: "L'utilisateur n'a pas été supprimé",
      error,
    })
    return res.status(500).json({
      success: false,
      message: "L'utilisateur n'a pas été supprimé",
    })
  }
}

/**
 * @typedef {Object} InfoAdmin
 * @property {string} email
 * @property {string[]} departements
 * @property {string[]} features
 * @property {EmailDepartement[]} emailsDepartements
 *
 * @typedef {Object} EmailDepartement
 * @property {string} _id
 * @property {string} email
 */
