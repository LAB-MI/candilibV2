/**
 * Contrôleur regroupant les fonctions de récupération des infos admin
 * @module routes/admin/admin-controllers
 */
import {
  findUserById,
  createUser,
  deleteUserByEmail,
  findUserByEmail,
} from '../../models/user'
import { findDepartementById } from '../../models/departement'

import { appLogger, email as regexEmail } from '../../util'
import config from '../../config'
import { createPassword } from '../../util/password'
import { sendMailResetLink } from '../business/send-mail-reset-password'

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
      message: "l'adresse courriel n'est pas valide",
    })
  }
  const userExist = await findUserByEmail(email)
  if (userExist) {
    return res.status(400).json({
      success: false,
      message: 'cette adresse courriel est déja utilisé',
    })
  }
  try {
    const userInfo = await findUserById(req.userId)
    if (
      userInfo.status === config.userStatuses.DELEGUE &&
      status === config.userStatuses.REPARTITEUR
    ) {
      const password = createPassword()
      const user = await createUser(email, password, departements, status)
      if (user) {
        await sendMailResetLink(email)
        appLogger.info({
          ...loggerInfo,
          action: 'created-user',
          description:
            ' Utilisateur a bien été créé et un courriel lui a été envoyé',
        })
        return res.status(201).json({
          success: true,
          message: 'Utilisateur a bien été créé',
        })
      }
      return res.status(400)({
        success: false,
        message: `l'utilisateur ${user.email} est déja enregistré en base`,
      })
    }
    if (
      userInfo.status === config.userStatuses.ADMIN &&
      (status === config.userStatuses.DELEGUE ||
        status === config.userStatuses.REPARTITEUR)
    ) {
      const password = createPassword()
      const user = await createUser(email, password, departements, status)
      if (user) {
        await sendMailResetLink(email)
        appLogger.info({
          ...loggerInfo,
          action: 'created-user',
          description:
            ' Utilisateur a bien été créé et un courriel lui a été envoyé',
        })
        return res.status(201).json({
          success: true,
          message: 'Utilisateur a bien été créé et un courriel lui a été envoyé ',
        })
      }
      return res.status(400)({
        success: false,
        message: `l'utilisateur ${user.email} est déja enregistré en base`,
      })
    }
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: 'Utilisateur n\'a pas créé',
      error,
    })
    return res.status(500).json({
      success: false,
      message: "l'utilisateur n'a pas été créé",
    })
  }
}

export const deleteUserByAdmin = async (req, res) => {
  const { email, status } = req.body
  const loggerInfo = {
    section: 'admin',
    action: 'delete-user',
    admin: req.userId,
  }
  appLogger.info(loggerInfo)
  try {
    const userInfo = await findUserById(req.userId)
    const user = await findUserByEmail(email)
    if (
      userInfo.status === config.userStatuses.DELEGUE &&
      status === config.userStatuses.REPARTITEUR
    ) {
      if (user) {
        await deleteUserByEmail(email)
        appLogger.info({
          ...loggerInfo,
          action: 'delete-user',
          description: ' Utilisateur a bien été supprimé ',
        })
        return res.status(200).json({
          success: true,
          message: 'Utilisateur a bien été supprimé',
        })
      }
      return res.status(400).json({
        success: false,
        message: "Utilisateur n'existe pas",
      })
    }
    if (
      userInfo.status === config.userStatuses.ADMIN &&
      (status === config.userStatuses.DELEGUE ||
        status === config.userStatuses.REPARTITEUR)
    ) {
      if (user) {
        await deleteUserByEmail(email)
        appLogger.info({
          ...loggerInfo,
          action: 'delete-user',
          description: ' Utilisateur a bien été supprimé ',
        })
        return res.status(200).json({
          success: true,
          message: 'Utilisateur a bien été supprimé',
        })
      }
      return res.status(400).json({
        success: false,
        message: "Utilisateur n'existe pas",
      })
    }
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: "Utilisateur n'a pas été supprimé",
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
