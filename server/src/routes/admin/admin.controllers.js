/**
 * Contrôleur regroupant les fonctions de récupération des infos admin
 * @module routes/admin/admin-controllers
 */
import { findUserById } from '../../models/user'
import { findDepartementById } from '../../models/departement'

import { appLogger } from '../../util'
import config from '../../config'
import { sendMailCreateAccount } from '../business/send-mail-create-account'
import { sendMailConfirmationUpdateUserInfo } from '../business/send-mail-update-user-info'
import {
  getAppropriateUsers,
  createAppropriateUser,
  updateUserBusiness,
  archiveUserBusiness,
} from './business'

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
    departements.map(findDepartementById),
  )

  const features = config.userStatusFeatures[status]

  return {
    email,
    departements,
    status,
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
 * @param {string} req.body.status - Statut de l'utilisateur créé
 * @param {import('express').Response} res
 */
export const createUserController = async (req, res) => {
  const { email, status, departements } = req.body
  const loggerInfo = {
    section: 'admin-create-user',
    action: 'post-user',
    admin: req.userId,
    departements,
    email,
    status,
  }

  appLogger.info(loggerInfo)

  try {
    const user = await createAppropriateUser(
      req.userId,
      email,
      status,
      departements,
    )

    await sendMailCreateAccount(email)
    appLogger.info({
      ...loggerInfo,
      action: 'created-user',
      description:
        "L'utilisateur a bien été créé et un courriel lui a été envoyé",
    })

    return res.status(201).json({
      success: true,
      message: `L'utilisateur a bien été créé et un courriel de mise à jour de mot passe a été envoyé à ${email}`,
      user,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })

    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * Récupère un utilisateur
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId - Id de l'utilisateur souhaitant créér un délégué ou un répartiteur
 * @param {string} req.body.email - Adresse courriel de l'utilisateur trouvé
 * @param {string} req.body.departements - Départements de l'utilisateur trouvé
 * @param {string} req.body.status - Statut de l'utilisateur trouvé
 * @param {import('express').Response} res
 */
export const getUsers = async (req, res) => {
  const loggerInfo = {
    section: 'admin-get-user',
    action: 'get-user',
    admin: req.userId,
  }

  appLogger.info(loggerInfo)

  try {
    const users = await getAppropriateUsers(req.userId)

    appLogger.info({
      ...loggerInfo,
      nbOfFoundUsers: users.length,
    })

    return res.status(200).json({ success: true, users })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: `Impossible de récupérer les utilisateurs : ${error.message}`,
      error,
    })

    return res.status(error.status || 500).json({
      success: false,
      message: error.message,
    })
  }
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
 * @param {string} req.body.status - Statut de l'utilisateur mis à jour
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

  try {
    const updatedUser = await updateUserBusiness(
      req.userId,
      email,
      status,
      departements,
    )
    await sendMailConfirmationUpdateUserInfo(email)

    res.status(200).json({
      success: true,
      message: "Les informations de l'utilisateur ont été modifiées",
      user: updatedUser,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })

    res.status(error.status || 500).json({
      success: false,
      message: error.message,
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
 * @param {string} req.body.status - Statut de l'utilisateur supprimer
 * @param {import('express').Response} res
 */
export const archiveUserController = async (req, res) => {
  const { email: emailToDelete } = req.body

  const loggerInfo = {
    section: 'admin-delete-user',
    action: 'delete-user',
    admin: req.userId,
    emailToDelete,
  }

  appLogger.info(loggerInfo)

  try {
    const archivedUser = await archiveUserBusiness(req.userId, emailToDelete)

    appLogger.info({
      ...loggerInfo,
      action: 'delete-user',
      description: "L'utilisateur a bien été archivé",
    })

    res.status(200).json({
      success: true,
      message: "L'utilisateur a été archivé",
      archivedUser,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: "L'utilisateur n'a pas été archivé",
      error,
    })

    res.status(error.status || 500).json({
      success: false,
      message: error.message,
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
