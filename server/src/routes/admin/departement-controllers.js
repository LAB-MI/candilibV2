/**
 * Contrôleurs pour la gestion des départements
 *
 * @module routes/admin/departement-controllers
 */

import {
  createDepartements,
  deleteDepartement,
  getDepartements,
  isContainingCentre,
  isDepartementAlreadyExist,
  isEmailAlreadyUse,
  removeDepartementOfUsersByStatus,
  updateDepartements,
  updateDepartementsUsersAdminAndTech,
} from './departement-business'

import { appLogger } from '../../util'
// import { appLogger } from '../../util/logger'

import { appLogger } from '../../util'

import {
  BAD_PARAMS,
  DEPARTEMENT_ALREADY_EXIST,
  DEPARTEMENT_EMAIL_ALREADY_USED,
  EMAIL_ALREADY_USE,
  ERROR_AT_DEPARTEMENT_CREATION,
  ERROR_UPDATE_ADMIN_AND_TECH_USERS,
  ERROR_UPDATE_DEPARTEMENT,
  FETCH_ALL_DEPARTEMENTS,
  INVALID_DEPARTEMENT_EMAIL,
  INVALID_DEPARTEMENT_NUMBER,
  INVALID_EMAIL_INSERT,
} from './message.constants'

import config from '../../config'

/**
 * Crée un département
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId - Identifiant de l'utilisateur
 *
 * @param {Object} req.body
 * @param {string} req.body.departementId - Identifiant du département
 * @param {string} req.body.departementEmail - Adresse courriel du département
 */
export const createDepartementsController = async (req, res) => {
  const { departementId, departementEmail } = req.body
  const loggerInfo = {
    section: 'admin-departement',
    action: 'create-departement',
    admin: req.userId,
    departementId,
    departementEmail,
  }
  if (!departementId) {
    const message = INVALID_DEPARTEMENT_NUMBER
    appLogger.warn({
      ...loggerInfo,
      description: message,
    })
    return res.status(400).json({
      success: false,
      message,
    })
  }

  if (!departementEmail) {
    const message = INVALID_DEPARTEMENT_EMAIL
    appLogger.warn({
      ...loggerInfo,
      description: message,
    })
    return res.status(400).json({
      success: false,
      message,
    })
  }

  try {

    const isEmailUsed = await isEmailAlreadyUse(departementEmail)

    if (isEmailUsed) {
      const message = DEPARTEMENT_EMAIL_ALREADY_USED
      appLogger.warn({
        ...loggerInfo,
        description: message,
      })
      return res.status(400).json({
        success: false,
        message,
      })
    }

    const isExist = await isDepartementAlreadyExist(departementId)
    if (isExist) {
      const message = DEPARTEMENT_ALREADY_EXIST
      appLogger.info({
        ...loggerInfo,
        descripton: message,
      })
      res.status(400).json({
        success: false,
        message,
      })
    }

    const departementCreated = await createDepartements(
      departementId,
      departementEmail
    )
    const isUsersUpdated = await updateDepartementsUsersAdminAndTech(
      departementId
    )
    let message = ''
    if (isUsersUpdated) {
      message = `Le département ${departementCreated._id} a bien été créé avec l'adresse courriel ${departementCreated.email}`
      appLogger.info({
        ...loggerInfo,
        descripton: message,
      })

      return res.status(200).json({
        success: true,
        message,
      })
    }

    message = ERROR_UPDATE_ADMIN_AND_TECH_USERS
    await deleteDepartement(departementCreated._id)
    throw new Error(message)
  } catch (error) {
    const message = ERROR_AT_DEPARTEMENT_CREATION
    appLogger.error({
      ...loggerInfo,
      description: error.message,
    })

    res.status(500).json({
      success: false,
      message,
    })
  }
}
/**
 * Récupère les informations d'un ou plusieurs départements
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId - Identifiant de l'utilisateur
 *
 * @param {Object} req.query
 * @param {string} req.query.id - Identifiant du département
 */
export const getDepartementsController = async (req, res) => {
  const departementId = req.params.id
  const loggerInfo = {
    section: 'admin-departement',
    action: 'get-departements',
    admin: req.userId,
    departementId,
  }

  try {
    if (departementId) {
      const result = [await getDepartements(departementId)]

      appLogger.info({
        ...loggerInfo,
        departementId,
        description: 'Get one departement',
      })
      return res.status(200).json({
        success: true,
        result,
      })
    }

    const result = await getDepartements()
    const message = FETCH_ALL_DEPARTEMENTS
    appLogger.info({
      ...loggerInfo,
      description: message,
      nbDepartement: result.length,
    })

    res.status(200).json({
      success: true,
      result,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })

    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * Supprime un département
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId - Identifiant de l'utilisateur
 *
 * @param {Object} req.query
 * @param {string} req.query.id - Identifiant du département
 */
export const deleteDepartementController = async (req, res) => {
  const departementId = req.params.id
  const loggerInfo = {
    section: 'admin-departement',
    action: 'delete-departement',
    admin: req.userId,
    departementId,
  }

  try {
    let message = ''
    if (departementId) {
      const isDepartementUsed = await isContainingCentre(departementId)
      if (!isDepartementUsed) {
        const userStatus = [
          config.userStatuses.ADMIN,
          config.userStatuses.TECH,
          config.userStatuses.REPARTITEUR,
          config.userStatuses.DELEGUE,
        ]

        const isDepartementRemovedFromUsers = await removeDepartementOfUsersByStatus(
          departementId,
          userStatus
        )
        if (isDepartementRemovedFromUsers) {
          await deleteDepartement(departementId)
          message = `Le département ${departementId} a bien été supprimé`
          appLogger.info({
            ...loggerInfo,
            description: message,
          })
          return res.status(200).json({
            success: true,
            message,
          })
        }
        message = `Erreur survenue, impossible de supprimer le département ${departementId} pour les admins, répartiteurs et délégués, le département n'a donc pas été supprimé.`

        throw new Error(message)
      }
      message = `Le département ${departementId} n'a pas été supprimé, car des centres y sont liés`
      throw new Error(message)
    }
    message = BAD_PARAMS

    appLogger.error({
      ...loggerInfo,
      description: message,
    })

    return res.status(400).json({
      success: false,
      message,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })

    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * Met à jour les informations d'un département
 *
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId - Identifiant de l'utilisateur
 *
 * @param {Object} req.body
 * @param {string} req.body.departementId - Identifiant du département
 * @param {string} req.body.newEmail - Nouvelle adresse courriel
 */
export const updateDepartementsController = async (req, res) => {
  const departementId = req.params.id
  const { newEmail } = req.body

  const loggerInfo = {
    section: 'admin-departement',
    action: 'update-departement',
    admin: req.userId,
    departementId,
    newEmail,
  }

  if (!departementId) {
    const message = BAD_PARAMS

    appLogger.info({
      ...loggerInfo,
      description: message,
    })
    return res.status(400).json({
      success: false,
      message,
    })
  }

  if (!newEmail) {
    const message = INVALID_EMAIL_INSERT

    appLogger.info({
      ...loggerInfo,
      description: message,
    })
    return res.status(400).json({
      success: false,
      message,
    })
  }

  const isEmailUsed = await isEmailAlreadyUse(newEmail)
  if (isEmailUsed) {
    const message = EMAIL_ALREADY_USE

    appLogger.info({
      ...loggerInfo,
      description: message,
    })
    return res.status(400).json({
      success: false,
      message,
    })
  }

  try {
    const result = await updateDepartements({
      _id: departementId,
      email: newEmail,
    })
    const message = `Le département ${departementId} a bien été mis à jour`
    appLogger.info({
      ...loggerInfo,
      description: message,
    })

    return res.status(200).json({
      success: true,
      message,
      result,
    })
  } catch (error) {
    const message = ERROR_UPDATE_DEPARTEMENT

    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })

    return res.status(500).json({
      success: false,
      message,
    })
  }
}
