import jwt from 'jsonwebtoken'

import { logger } from '../../util'
import config from '../../config'
import { findActiveCandidatByEmail } from '../../models/candidat'
import { sendMagicLink } from '../business'

export const postMagicLink = async (req, res) => {
  const { email } = req.body
  logger.info(email)

  try {
    const candidat = await findActiveCandidatByEmail(email)

    if (!candidat) {
      const error = new Error('Utilisateur non reconnu')
      error.status = 404
      throw error
    }

    if (!candidat.isValid) {
      const error = new Error('Utiliseur en attente de validation.')
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
      logger.info('token: ' + token)
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
    return res.status(error.status || 500).send({
      message: error.message,
      success: false,
    })
  }
}
