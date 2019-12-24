/**
 * Contrôleur regroupant les fonctions d'actions sur les départements
 * @module routes/admin/departement-controllers
 */

import {
  createDepartements,
  getDepartements,
  updateDepartements,
} from './departement-business'
import { appLogger } from '../../util'
// import { appLogger } from '../../util/logger'

// TODO: definir les message dans le fichier constant et les log

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
  const loggerInfo = {
    section: 'admin-departement',
    action: 'create-departement',
    admin: req.userId,
  }
  const { departementId, departementEmail } = req.body
  const message = 'Numéro de département non renséigné'
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
    await createDepartements(departementId, departementEmail)
    const message = `Le département ${departementId} a bien été crée`
    appLogger.info({
      ...loggerInfo,
      departementId,
      departementEmail,
      descripton: message,
    })

    res.status(200).json({
      success: true,
      message,
    })
  } catch (error) {
    const message = 'Erreur survenue lors de création du département'
    appLogger.error({
      ...loggerInfo,
      departementId,
      departementEmail,
      error,
    })

    res.status(500).json({
      success: false,
      message,
    })
  }
}
// TODO: definir les message dans le fichier constant et les log
/**
 * Récupère les informations d'un ou plusieurs départements
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 *
 * @param {Object} req.body
 * @param {string} req.body.departementId Un Array contenant une liste d'ID de département
 */
export const getDepartementsController = async (req, res) => {
  const loggerInfo = {
    section: 'admin-departement',
    action: 'get-departement',
    admin: req.userId,
  }
  // req.query
  const { departementId } = req.body

  try {
    if (departementId) {
      const result = await getDepartements(departementId)

      appLogger.info({
        ...loggerInfo,
        departementId,
      })
      return res.status(200).json({
        success: true,
        result,
      })
    }

    const result = await getDepartements()
    const message = 'Récupération de tous les département'
    appLogger.info({
      ...loggerInfo,
      message,
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
// TODO: definir les message dans le fichier constant et les log
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
    const message = 'Paramètre saisie invalide'

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
    const message = 'Adresse courriel du departement manquante saisie invalide'

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
    const message =
      "Une erreur c'est produite lors de la mise à jour du département"
    appLogger.error({ ...loggerInfo, departementId, error })
    return res.status(500).json({
      success: false,
      message,
    })
  }
}
