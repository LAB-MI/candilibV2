import jwt from 'jsonwebtoken'

import { appLogger } from '../../util'
import config from '../../config'
import {
  findActiveCandidatByEmail,
  isCandidatExist,
} from '../../models/candidat'
import { sendMagicLink } from '../business'
import { INVALID_TOKEN_PLEASE_RECONNECT } from '../message.constants.js'

export const postMagicLink = async (req, res) => {
  const { email } = req.body
  const LoggerInfo = {
    section: 'candidat-auth',
    action: 'post-magic-link',
    email,
  }
  appLogger.info(LoggerInfo)

  try {
    const candidat = await findActiveCandidatByEmail(email)

    if (!candidat) {
      const error = new Error('Utilisateur non reconnu')
      error.status = 404
      throw error
    }

    if (!candidat.isValidatedByAurige) {
      const error = new Error('Utilisateur en attente de validation.')
      error.status = 401
      throw error
    }

    const token = jwt.sign(
      {
        id: candidat._id,
      },
      config.secret,
      {
        expiresIn: config.candidatTokenExpiration,
      }
    )

    try {
      appLogger.info({ ...LoggerInfo, token })
      const response = await sendMagicLink(candidat, token)
      res.status(200).send({
        success: true,
        response,
        message:
          'Veuillez consulter votre boîte mail pour vous connecter (pensez à vérifier dans vos courriers indésirables).',
      })
    } catch (error) {
      throw new Error(
        "Un problème est survenu lors de l'envoi du lien de connexion. Nous vous prions de réessayer plus tard."
      )
    }
  } catch (error) {
    appLogger.error({
      ...LoggerInfo,
      error,
    })
    return res.status(error.status || 500).send({
      message: error.message,
      success: false,
    })
  }
}

export const checkCandidat = async (req, res) => {
  const { userId } = req
  const LoggerInfo = {
    section: 'candidat-auth',
    action: 'CHECK-EXIST',
    userId,
  }
  appLogger.info(LoggerInfo)
  try {
    const isExist = await isCandidatExist(userId)
    if (!isExist) {
      const error = new Error('Candidat non trouvé')
      error.status = 401
      throw error
    }
    return res.json({ auth: true })
  } catch (error) {
    appLogger.error({
      ...LoggerInfo,
      error,
    })
    return res.status(error.status || 500).send({
      isTokenValid: false,
      message: INVALID_TOKEN_PLEASE_RECONNECT,
      success: false,
      auth: false,
    })
  }
}
