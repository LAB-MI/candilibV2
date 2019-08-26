import jwt from 'jsonwebtoken'

import { appLogger } from '../../util'
import config from '../../config'
import {
  findActiveCandidatByEmail,
  isCandidatExisting,
} from '../../models/candidat'
import { sendMagicLink } from '../business'
import { sendErrorResponse } from '../../util/send-error-response';

export const postMagicLink = async (req, res) => {
  const { email } = req.body
  const loggerInfo = {
    section: 'candidat-auth',
    action: 'post-magic-link',
    email,
  }
  appLogger.info({ ...loggerInfo, message: `Trying to find candidat with email: ${email}` })

  try {
    const candidat = await findActiveCandidatByEmail(email)

    if (!candidat) {
      const message = 'Utilisateur non reconnu'
      const status = 404
      return sendErrorResponse(res, { loggerInfo, message, status })
    }

    if (!candidat.isValidatedByAurige) {
      const message = 'Utilisateur en attente de validation.'
      const status = 401
      return sendErrorResponse(res, { loggerInfo, message, status })
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
      appLogger.info({ ...loggerInfo, message: `Trying to send magic-link to ${email}` })
      const response = await sendMagicLink(candidat, token)
      res.status(200).json({
        message:
          'Veuillez consulter votre boîte mail pour vous connecter (pensez à vérifier dans vos courriers indésirables).',
        response,
        success: true,
      })
    } catch (error) {
      appLogger.error({
        error,
        ...loggerInfo,
        message: `Impossible d'envoyer le mail à ${email}`,
      })

      const message = "Un problème est survenu lors de l'envoi du lien de connexion. Nous vous prions de réessayer plus tard."
      return res.status(500).json({
        message,
        success: false,
      })
    }
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      error,
    })
    res.status(error.status || 500).json({
      message: error.message,
      success: false,
    })
  }
}

export const checkCandidat = async (req, res) => {
  const { userId: candidatId } = req
  const loggerInfo = {
    section: 'candidat-auth',
    action: 'CHECK-EXIST',
    candidatId,
  }

  appLogger.info({ ...loggerInfo, message: ''})

  try {
    console.log('b4 isCandidatExisting')
    const isExisting = await isCandidatExisting(candidatId)
    if (!isExisting) {
      const message = 'Candidat non trouvé'
      const status = 401
      sendErrorResponse(res, { loggerInfo, message, status })
      console.log(message)
      const error = new Error(message)
      error.status = status
      throw error
    }
    return res.json({ auth: true })
  } catch (error) {
    if (!error.status) {
      appLogger.error({
        ...loggerInfo,
        description: error.message,
        error,
      })
    }
    return res.status(error.status || 500).json({
      auth: false,
      isTokenValid: false,
      message: 'Token invalide',
      success: false,
    })
  }
}
