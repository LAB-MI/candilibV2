/**
 * Contrôleur regroupant les fonctions traitant de la liste blanche à l'attention des répartiteurs
 * @module routes/admin/whitelisted-controllers
 */
import messages from './whitelist.messages'
import {
  findWhitelistedByEmail,
  createWhitelisted,
  createWhitelistedBatch,
  deleteWhitelisted,
  findWhitelistedMatching,
  findLastCreatedWhitelisted,
} from '../../models/whitelisted'
import { appLogger } from '../../util'
import {
  UNKNOWN_ERROR_REMOVE_WHITELISTED,
  UNKNOWN_ERROR_GET_WHITELISTED,
  UNKNOWN_ERROR_ADD_WHITELISTED,
} from './message.constants'

/**
 * Vérifie si une adresse est dans la liste blanche
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {Object} req.body
 * @param {string} req.body.email L'adresse à vérifier
 *
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
export const isWhitelisted = async (req, res, next) => {
  const email = req.body && req.body.email
  if (!email) {
    return res.status(401).json({
      codemessage: 'ERROR_FIELDS_EMPTY',
      message: messages.ERROR_FIELDS_EMPTY,
      success: false,
    })
  }

  try {
    const candidat = await findWhitelistedByEmail(email.toLowerCase())
    if (candidat === null) {
      return res.status(401).json({
        codemessage: 'NO_AUTH_WHITELIST',
        message: messages.NO_AUTH_WHITELIST,
        success: false,
      })
    }
    return next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    })
  }
}

/**
 * Vérifie si les paramètres pour la requête d'aujout dans la liste blanche sont acceptables
 * @function
 *
 * @param {Object} body
 * @param {string} body.email Une adresse
 * @param {string[]} body.emails Un lot d'adresses
 */
const checkAddWhitelistRequest = body => {
  const { email, emails } = body
  if (email && emails) {
    const error = new Error(
      'Parameters "email" and "emails" cannot be sent in the same request'
    )
    error.statusCode = 409
    throw error
  }
  if (!email && !emails) {
    const error = new Error(
      'Either "email" or "emails" parameter must be sent in body'
    )
    error.statusCode = 400
    throw error
  }
}

/**
 * Messages à retourner à l'utilisateur en fonction du code du status de la requête, lors d'un ajout dans la liste blanche
 * @constant
 */
const batchWhitelistMessages = {
  201: 'Tous les emails ont été ajoutés à la liste blanche',
  207: "Certains emails n'ont pas pu être ajoutés à la liste blanche",
  422: "Aucun email n'a pu être ajouté à la liste blanche",
}

/**
 * Status à retourner à l'utilisateur en fonction du code du status de la requête, lors d'un ajout dans la liste blanche
 * @constant
 */
const batchWhitelistStatuses = {
  201: 'success',
  207: 'warning',
  422: 'error',
}

/**
 * Ajoute une ou plusieures adresses dans la liste blanche
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 * @param {Object} req.body
 * @param {string} req.body.email Une adresse à ajouter
 * @param {string[]} req.body.emails Un lot d'adresses à ajouter
 * @param {string} req.body.departement Le département pour lequel la ou les adresses seront ajoutées
 *
 * @param {import('express').Response} res
 */
export const addWhitelisted = async (req, res) => {
  const { email, emails, departement } = req.body
  const loggerInfo = {
    section: 'admin-add-whitelisted',
    email,
    emails,
    departement,
    admin: req.userId,
  }
  try {
    loggerInfo.action = 'CHECK_REQUEST'
    checkAddWhitelistRequest(req.body)

    if (email) {
      loggerInfo.action = 'ADD_ONE'
      const result = await createWhitelisted(email, departement)
      appLogger.info({
        ...loggerInfo,
        description: `${email} ajouté dans la whitelist du ${departement}`,
      })
      res.status(201).json(result)
      return
    }
    if (emails) {
      loggerInfo.action = 'ADD_MANY'
      const result = await createWhitelistedBatch(
        emails.filter(em => em && em.trim()),
        departement
      )
      const allSucceeded = result.every(whitelisted => whitelisted.success)
      const allFailed = result.every(whitelisted => !whitelisted.success)
      const code = allSucceeded ? 201 : allFailed ? 422 : 207
      appLogger.info({
        ...loggerInfo,
        description:
          'Il y a ' +
          result.filter(whitelisted => whitelisted.success).length +
          ' ajoutés et ' +
          result.filter(whitelisted => !whitelisted.success).length +
          ' non ajoutés',
      })
      res.status(code).json({
        code,
        result,
        status: batchWhitelistStatuses[code],
        message: batchWhitelistMessages[code],
      })
    }
  } catch (error) {
    if (email && error.message.includes('duplicate key error')) {
      const { departement } = await findWhitelistedByEmail(email.toLowerCase())
      if (departement) {
        const message = `Email ${email} déjà existant dans le département ${departement}`
        appLogger.warn({
          ...loggerInfo,
          description: message,
        })
        return res.status(400).json({
          success: false,
          message,
          departement,
        })
      }
    }
    const loggerFct = error.statusCode ? appLogger.warn : appLogger.error
    const action = loggerInfo.action || 'ERROR'
    loggerFct({
      ...loggerInfo,
      action,
      description: error.message,
      error,
    })

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode ? error.message : UNKNOWN_ERROR_ADD_WHITELISTED,
    })
  }
}

/**
 * Cherche des adresses de la liste blanche.
 * Si le paramètre matching n'est pas renseigné, renvoie les 50 dernières adresses entrées
 * @async
 * @function
 *
 * @param {import('express').Request} req
 * @param {string} req.userId Id de l'utilisateur
 * @param {Object} req.query
 * @param {string} req.query.departement Le département dans lequel les adresses seront cherchées
 * @param {string} req.query.matching Une chaîne de caractères pour chercher une adresse
 *
 * @param {import('express').Response} res
 */
export const getWhitelisted = async (req, res) => {
  const { departement, matching } = req.query
  const loggerInfo = {
    section: 'admin-get-whitelisted',
    departement,
    matching,
    admin: req.userId,
  }

  try {
    if (matching) {
      loggerInfo.action = 'SEARCH_WHITELISTED'
      const whitelist = await findWhitelistedMatching(matching, departement)
      appLogger.info({
        ...loggerInfo,
        description:
          "Le nombre d'emails trouvés : " + whitelist ? 0 : whitelist.length,
      })
      res.status(200).json(whitelist)
      return
    }
    loggerInfo.action = 'GET_WHITELISTED'
    const lastCreated = await findLastCreatedWhitelisted(departement)
    appLogger.info({
      ...loggerInfo,
      description:
        "Le nombre d'emails trouvés : " + lastCreated ? 0 : lastCreated.length,
    })
    res.status(200).json({ success: true, lastCreated })
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })
    return res.status(500).json({
      success: false,
      message: UNKNOWN_ERROR_GET_WHITELISTED,
    })
  }
}

export const removeWhitelisted = async (req, res) => {
  const id = req.params.id
  const loggerInfo = {
    section: 'admin-remove-whitelisted',
    whitelistedId: id,
    admin: req.userId,
    action: 'REMOVE_EMAIL',
  }
  try {
    const whitelisted = await deleteWhitelisted(id)
    appLogger.info({
      ...loggerInfo,
      description: "L'e-mail est supprimé de la whitelist",
      whitelisted,
    })
    res.status(200).json(whitelisted)
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.message,
      error,
    })
    return res.status(500).json({
      success: false,
      message: UNKNOWN_ERROR_REMOVE_WHITELISTED,
    })
  }
}
