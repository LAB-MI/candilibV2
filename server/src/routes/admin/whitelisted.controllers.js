import messages from './whitelist.messages'
import {
  findAllWhitelisted,
  findWhitelistedByEmail,
  createWhitelisted,
  createWhitelistedBatch,
  deleteWhitelisted,
} from '../../models/whitelisted'

export const isWhitelisted = async (req, res, next) => {
  const email = req.body && req.body.email
  if (!email) {
    return res.status(401).send({
      codemessage: 'ERROR_FIELDS_EMPTY',
      message: messages.ERROR_FIELDS_EMPTY,
      success: false,
    })
  }

  try {
    const candidat = await findWhitelistedByEmail(email.toLowerCase())
    if (candidat === null) {
      return res.status(401).send({
        codemessage: 'NO_AUTH_WHITELIST',
        message: messages.NO_AUTH_WHITELIST,
        success: false,
      })
    }
    return next()
  } catch (error) {
    return res.status(500).send({
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
  '201': 'Tous les emails ont été ajoutés à la liste blanche',
  '207': "Certains emails n'ont pas pu être ajoutés à la liste blanche",
  '422': "Aucun email n'a pu être ajouté à la liste blanche",
}

const batchWhitelistStatuses = {
  '201': 'success',
  '207': 'warning',
  '422': 'error',
}

export const addWhitelisted = async (req, res) => {
  try {
    const { email, emails, departement } = req.body
    checkAddWhitelistRequest(req.body)

    if (email) {
      const result = await createWhitelisted(email)
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
    return res.status(error.statusCode || 500).send({
      success: false,
      message: error.message,
    })
  }
}

export const getWhitelisted = async (req, res) => {
  const { departement } = req.query
  try {
    const whitelist = await findAllWhitelisted(departement)
    res.status(200).json(whitelist.map(({ email }) => email))
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    })
  }
}
export const removeWhitelisted = async (req, res) => {
  const id = req.params.id
  try {
    const whitelisted = await deleteWhitelisted(id)
    res.status(200).json(whitelisted)
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    })
  }
}
