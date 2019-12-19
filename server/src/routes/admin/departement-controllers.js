// TODO: JSDOC
/**
 * Contrôleur regroupant les fonctions d'actions sur les départements
 * @module routes/admin/departement-controllers
 */

// TODO: DEPLACER DANS LE BUSINESS
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
 * @param {string} req.body._id Une chaîne de caractères correspondant à l'ID du département
 * @param {string} req.body.email Une chaîne de caractères correspondant à l'adresse courriel du département
 */
export const createDepartementsController = async (req, res) => {
  const loggerInfo = {
    section: 'admin-departement',
    action: 'create-departement',
    admin: req.userId,
  }
  const { _id, email } = req.body
  if (!_id) {
    appLogger.warn({
      ...loggerInfo,
      id: _id,
      email,
    })
    return res.status(400).json({
      success: false,
      message: 'pas de numéro de département renséigné',
    })
  }
  try {
    await createDepartements(_id, email)
  } catch (error) {
    const message = 'Erreur survenue lors de création du département'
    appLogger.error({
      ...loggerInfo,
      id: _id,
      email,
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
 * @param {Object} req.body.departementIds Un Array contenant une liste d'ID de département
 */
export const getDepartementsController = async (req, res) => {
  const loggerInfo = {
    section: 'admin-departement',
    action: 'get-departement',
    admin: req.userId,
  }
  // req.query
  const { departementIds } = req.body

  if (!departementIds.length) {
    const message = 'Paramètre saisie invalide'
    appLogger.warn({
      ...loggerInfo,
      departementIds,
      description: message,
    })
    res.status(400).json({
      success: false,
      message,
    })
  }

  try {
    const result = await getDepartements(departementIds)
    appLogger.info({
      ...loggerInfo,
      departementIds,
    })

    res.status(200).json({
      success: true,
      result,
    })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      departementIds,
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
 */
export const updateDepartementsController = async (req, res) => {
  const loggerInfo = {
    section: 'admin-departement',
    action: 'update-departement',
    admin: req.userId,
  }

  const { departementId } = req.body

  if (!departementId) {
    const message = 'Paramètre saisie invalide'

    appLogger.info({
      ...loggerInfo,
      departementId,
      description: message,
    })
    return res.status(400).json({
      success: false,
      message,
    })
  }
  try {
    const result = await updateDepartements()
    const message = 'Paramètre saisie invalide'
    appLogger.info({
      ...loggerInfo,
      message,
    })

    return res.status(200).json({
      success: true,
      result,
    })
  } catch (error) {
    appLogger.error({ ...loggerInfo, departementId, error })
    return res.status(500).json({
      success: false,
      message: 'Une erreur c\'est produite lors de la mise à jour du département',
    })
  }
}
