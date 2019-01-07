import messages from './whitelist.messages'
import {
  findAllWhitelisted,
  findWhitelistedByEmail,
  createWhitelisted,
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

export const addWhitelist = async (req, res) => {
  try {
    const { email } = req.body
    const newWhitelisted = await createWhitelisted(email)
    res.status(200).json(newWhitelisted)
  } catch (error) {
    return res.status(500).send({
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
