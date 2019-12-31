/**
 * Contrôleur regroupant les fonctions d'actions sur les départements
 * @module routes/admin/departement-controllers
 */

import {
  createDepartements,
  deleteDepartement,
  getDepartements,
  isDepartementAlreadyExist,
  updateDepartements,
  updateDepartementsUsersAdminAndTech,
} from './departement-business'

import {
  BAD_PARAMS,
  DEPARTEMENT_ALREADY_EXIST,
  ERROR_AT_DEPARTEMENT_CREATION,
  ERROR_UPDATE_ADMIN_AND_TECH_USERS,
  ERROR_UPDATE_DEPARTEMENT,
  FETCH_ALL_DEPARTEMENTS,
  INVALID_DEPARTEMENT_NUMBER,
  INVALID_EMAIL_INSERT,
} from './message.constants'

import { appLogger } from '../../util'

/**
 * Crée un département
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 *
 * @param {Object} req.body
 * @param {string} req.body.departementId Une chaîne de caractères correspondant à l'ID du département
 * @param {string} req.body.departementEmail Une chaîne de caractères correspondant à l'adresse courriel du département
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
  const message = INVALID_DEPARTEMENT_NUMBER
  if (!departementId) {
    appLogger.warn({
      ...loggerInfo,
      departementId,
      departementEmail,
      message,
    })
    return res.status(400).json({
      success: false,
      message,
    })
  }
  try {
    const isExist = await isDepartementAlreadyExist(departementId)
    if (isExist) {
      const message = DEPARTEMENT_ALREADY_EXIST
      res.status(400).json({
        success: false,
        message,
      })
    }

    const departementCreated = await createDepartements(
      departementId,
      departementEmail
    )
    const isUsersUpdated = await updateDepartementsUsersAdminAndTech(departementId)
    let message = ''
    if (isUsersUpdated) {
      message = `Le département ${departementCreated._id} a bien été crée avec l'adresse courriel ${departementCreated.email}`
      appLogger.info({
        ...loggerInfo,
        departementId,
        departementEmail,
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
      departementId,
      departementEmail,
      description: message,
      error,
    })

    res.status(500).json({
      success: false,
      message,
    })
  }
}

/**
 * Récupère les informations d'un ou plusieurs départements
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 *
 * @param {Object} req.query
 * @param {string} req.query.id Une chaine de caractère représentant l'ID du département
 */
export const getDepartementsController = async (req, res) => {
  const departementId = req.query.id
  const loggerInfo = {
    section: 'admin-departement',
    action: 'get-departement',
    admin: req.userId,
    departementId,
  }

  try {
    // TODO: solution plus opti à trouver pour ce `if`
    if (
      departementId &&
      departementId !== 'undefined' &&
      departementId !== 'null'
    ) {
      const result = [await getDepartements(departementId)]

      appLogger.info({
        ...loggerInfo,
        departementId,
        description: 'get one departement',
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
    })

    res.status(200).json({
      success: true,
      result,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      departementId,
      error,
    })

    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * Supprime un départements
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 *
 * @param {Object} req.query
 * @param {string} req.query.id Une chaine de caractère représentant l'ID du département
 */
export const deleteDepartementController = async (req, res) => {
  const departementId = req.query.id
  const loggerInfo = {
    section: 'admin-departement',
    action: 'delete-departement',
    admin: req.userId,
    departementId,
  }

  try {
    let message = ''
    // TODO: solution plus opti à trouver pour ce `if`
    if (
      departementId &&
      departementId !== 'undefined' &&
      departementId !== 'null'
    ) {
      await deleteDepartement(departementId)
      // TODO: REMOVE DEPARTEMENT FROM USER ADMIN AND TECH
      message = `Le département ${departementId} a bien été supprimé`
      appLogger.info({
        ...loggerInfo,
        departementId,
        description: message,
      })
      return res.status(200).json({
        success: true,
        message,
      })
    }
    message = BAD_PARAMS

    return res.status(400).json({
      success: false,
      message,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      departementId,
      error,
    })

    res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * Met à jours les informations d'un département
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 *
 * @param {Object} req.body
 * @param {string} req.body.departementId Une chaîne de caractères correspondant à l'ID du département
 * @param {string} req.body.newEmail Une chaîne de caractères correspondant au nouveau courriel
 */
export const updateDepartementsController = async (req, res) => {
  const { departementId, newEmail } = req.body

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

  try {
    const result = await updateDepartements({
      _id: departementId,
      email: newEmail,
    })
    const message = `Le département ${departementId} a bien été mis à jour`
    appLogger.info({
      ...loggerInfo,
      message,
    })

    return res.status(200).json({
      success: true,
      message,
      result,
    })
  } catch (error) {
    const message = ERROR_UPDATE_DEPARTEMENT
    appLogger.error({ ...loggerInfo, departementId, error })
    return res.status(500).json({
      success: false,
      message,
    })
  }
}
