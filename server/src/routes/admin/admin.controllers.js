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
} from '../../models/user'
import { findDepartementById } from '../../models/departement'

import { appLogger, email as regexEmail } from '../../util'
import config from '../../config'
import { createPassword } from '../../util/password'
import { sendMailResetLink } from '../business/send-mail-reset-password'
import { sendMailConfirmationUpdateUserInfo } from '../business/send-mail-update-user-info'

/**
 * Récupère les infos de l'admin
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'admin souhaitant récupérer ses informations
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
 * @async
 * @function
 *
 * @param {string} userId Id de l'admin recherché
 *
 * @returns {InfoAdmin} Les informations de l'admin
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
 * Créé un utilisateur
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur souhaitant créér un délégué ou un répartiteur
 * @param {string} req.body.email Adresse courriel de l'utilisateur créér
 * @param {string} req.body.departements Départements de l'utilisateur créér
 * @param {string} req.body.status Status de l'utilisateur créér
 * @param {import('express').Response} res
 */

export const createUserByAdmin = async (req, res) => {
  const { email, departements, status } = req.body
  const loggerInfo = {
    section: 'admin',
    action: 'post-user',
    admin: req.userId,
  }

  appLogger.info(loggerInfo)

  const isValidEmail = regexEmail.test(email)
  if (!isValidEmail) {
    return res.status(400).json({
      success: false,
      message: "L'adresse courriel n'est pas valide",
    })
  }

  const user = await findUserById(req.userId)
  if (!isAbleToUpsertUser(status, user)) {
    res.status(401).json({
      success: false,
      message: "Vous n'êtes pas autorisé à créer un utilisateur",
    })
    return
  }

  try {
    const password = createPassword()
    const createdUser = await createUser(email, password, departements, status)
    if (createdUser) {
      await sendMailResetLink(email)
      appLogger.info({
        ...loggerInfo,
        action: 'created-user',
        description:
          "L'utilisateur a bien été créé et un courriel lui a été envoyé",
      })
      return res.status(201).json({
        success: true,
        message: "L'utilisateur a bien été créé",
      })
    }
    return res.status(400)({
      success: false,
      message: `L'utilisateur ${user.email} est déja enregistré en base`,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: "L'utilisateur n'a pas été créé",
      error,
    })
    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * Détermine si un utilisateur (`user`) a le droit de modifier les données d'un
 * utilisateur d'un niveau donné (`status`)
 *
 * @function
 *
 * @param {User} userToUpdate - Utilisateur dont les données sont à modifier
 * @param {User} user - Utilisateur exécutant l'action
 *
 * @returns {boolean} - `true` si l'utilisateur peut faire la modification, `false` sinon
 */
function isAbleToUpsertUser (status, user) {
  if (
    user.status === config.userStatuses.DELEGUE &&
    status === config.userStatuses.REPARTITEUR
  ) {
    return true
  }

  if (
    user.status === config.userStatuses.ADMIN &&
    (status === config.userStatuses.DELEGUE ||
      status === config.userStatuses.REPARTITEUR)
  ) {
    return true
  }

  return false
}

/**
 * Met à jour les informations de l'utilisateur
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur souhaitant modifier un délégué ou un répartiteur
 * @param {string} req.body.email Adresse courriel de l'utilisateur mis à jour
 * @param {string} req.body.departements Départements de l'utilisateur mis à jour
 * @param {string} req.body.status Status de l'utilisateur mis à jour
 * @param {import('express').Response} res
 */
export const updatedInfoUser = async (req, res) => {
  const { email, departements, status } = req.body
  const loggerInfo = {
    section: 'admin',
    action: 'put-user',
    admin: req.userId,
  }

  appLogger.info(loggerInfo)

  const isValidEmail = regexEmail.test(email)
  if (!isValidEmail) {
    return res.status(400).json({
      success: false,
      message: "l'adresse courriel n'est pas valide",
    })
  }

  const user = await findUserById(req.userId)
  const userToUpdate = await findUserByEmail(email)
  if (!isAbleToUpsertUser(userToUpdate.status, user)) {
    res.status(401).json({
      success: false,
      message: "Vous n'êtes pas autorisé à modifier cet utilisateur",
    })
    return
  }

  try {
    const updatedUser = await updateUser(email, departements, status)
    await sendMailConfirmationUpdateUserInfo(email)
    return res.status(200).json({
      success: true,
      message: "Les informations de l'utilisateur ont été modifiées",
      user: updatedUser,
    })
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message,
    })
  }
}
/**
 * Supprimer l'utilisateur
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur souhaitant supprimer un délégué ou un répartiteur
 * @param {string} req.body.email Adresse courriel de l'utilisateur supprimer
 * @param {string} req.body.departements Départements de l'utilisateur supprimer
 * @param {string} req.body.status Status de l'utilisateur supprimer
 * @param {import('express').Response} res
 */
export const deleteUserByAdmin = async (req, res) => {
  const { email: emailToDelete } = req.body
  const loggerInfo = {
    section: 'admin',
    action: 'delete-user',
    admin: req.userId,
  }
  appLogger.info(loggerInfo)

  const user = await findUserById(req.userId)
  const userToDelete = await findUserByEmail(emailToDelete)

  if (!userToDelete) {
    return res.status(400).json({
      success: false,
      message: "L'utilisateur n'existe pas",
    })
  }

  try {
    if (!isAbleToUpsertUser(userToDelete.status, user)) {
      res.status(401).json({
        success: false,
        message: "Vous n'êtes pas autorisé à supprimer cet utilisateur",
      })
      return
    }
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
      description: "l'utilisateur n'a pas été supprimé",
      error,
    })
    return res.status(500).json({
      success: false,
      message: "l'utilisateur n'a pas été supprimé",
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
