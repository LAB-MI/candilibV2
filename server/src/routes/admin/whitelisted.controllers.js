import messages from './whitelist.messages'
import {
  findAllWhitelisted,
  findWhitelistedByEmail,
  createWhitelisted,
  createWhitelistedBatch,
  deleteWhitelisted,
} from '../../models/whitelisted'

export const isWhitelisted = async (req, res, next) => {
  const { email } = req.body

  try {
    const candidat = await findWhitelistedByEmail(email)
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

export const addWhitelist = async (req, res) => {
  try {
    const { email, emails } = req.body
    checkAddWhitelistRequest(req.body)

    if (email) {
      const newWhitelisted = await createWhitelisted(email)
      res.status(201).json(newWhitelisted)
      return
    }
    if (emails) {
      const newWhitelisted = await createWhitelistedBatch(emails)
      if (newWhitelisted.every(whitelisted => whitelisted.success)) {
        res.status(201).json(newWhitelisted)
        return
      }
      if (newWhitelisted.every(whitelisted => !whitelisted.success)) {
        res.status(422).json(newWhitelisted)
        return
      }
      res.status(207).json(newWhitelisted)
    }
  } catch (error) {
    return res.status(error.statusCode || 500).send({
      success: false,
      message: error.message,
    })
  }
}

export const getWhitelisted = async (req, res) => {
  try {
    const whitelist = await findAllWhitelisted()
    res.status(200).json(whitelist)
  } catch (error) {
    return res.status(500).send({
      success: false,
      message: error.message,
    })
  }
}

export const deleteCandidat = async (req, res) => {
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
