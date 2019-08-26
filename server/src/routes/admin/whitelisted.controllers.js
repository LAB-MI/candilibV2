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
  UNKNOW_ERROR_REMOVE_WHITELISTED,
  UNKNOW_ERROR_GET_WHITELISTED,
} from './message.constants'

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

const batchWhitelistMessages = {
  201: 'Tous les emails ont été ajoutés à la liste blanche',
  207: "Certains emails n'ont pas pu être ajoutés à la liste blanche",
  422: "Aucun email n'a pu être ajouté à la liste blanche",
}

const batchWhitelistStatuses = {
  201: 'success',
  207: 'warning',
  422: 'error',
}

export const addWhitelisted = async (req, res) => {
  const { email, emails, departement } = req.body
  try {
    checkAddWhitelistRequest(req.body)

    if (email) {
      const result = await createWhitelisted(email, departement)
      res.status(201).json(result)
      return
    }
    if (emails) {
      const result = await createWhitelistedBatch(
        emails.filter(em => em && em.trim()),
        departement
      )
      const allSucceeded = result.every(whitelisted => whitelisted.success)
      const allFailed = result.every(whitelisted => !whitelisted.success)
      const code = allSucceeded ? 201 : allFailed ? 422 : 207
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
        return res.status(400).json({
          success: false,
          message: `Email: ${email} déjà existant dans le département: ${departement}`,
          departement,
        })
      }
    }
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    })
  }
}

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
          "Le nombre d'emails trouvés: " + whitelist ? 0 : whitelist.length,
        whitelist,
      })
      res.status(200).json(whitelist)
      return
    }
    loggerInfo.action = 'GET_WHITELISTED'
    const lastCreated = await findLastCreatedWhitelisted(departement)
    appLogger.info({
      ...loggerInfo,
      description:
        "Le nombre d'emails trouvés: " + lastCreated ? 0 : lastCreated.length,
      lastCreated,
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
      message: UNKNOW_ERROR_GET_WHITELISTED,
    })
  }
}

export const removeWhitelisted = async (req, res) => {
  const id = req.params.id
  const loggerInfo = {
    section: 'admin-remove-whitelisted',
    whitelsitedId: id,
    admin: req.userId,
    action: 'REMOVE_EMAIL',
  }
  try {
    const whitelisted = await deleteWhitelisted(id)
    appLogger.info({
      ...loggerInfo,
      description: "l'e-mail est supprimé de la whitelist",
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
      message: UNKNOW_ERROR_REMOVE_WHITELISTED,
    })
  }
}
