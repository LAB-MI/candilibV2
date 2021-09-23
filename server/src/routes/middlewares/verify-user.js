import { appLogger } from '../../util/logger'
import { validate as uuidValidate, version as uuidVersion } from 'uuid'
import { version } from '../../../package.json'

export const XUserId = 'X-USER-ID'

export async function verifyUser (req, res, next) {
  const xUserId = req.get(XUserId)
  const { userId } = req
  const message = 'Votre lien de connexion n\'est pas valide, veuillez en demander un autre via le bouton "Déjà inscrit"'
  const loggerInfo = {
    request_id: req.request_id,
    section: 'verify-user',
    userId,
  }

  try {
    const clientId = req.headers['x-client-id'].split(`.${version}`)[0]
    const isVersion = await uuidVersion(clientId)
    const valideClientId = await uuidValidate(clientId)

    if (!xUserId || !userId || xUserId !== userId || !valideClientId || isVersion !== 4) {
      const error = Error(message)
      error.status = 401
      throw error
    }

    next()
  } catch (error) {
    appLogger.error({
      ...loggerInfo,
      description: error.messge,
      error,
    })
    return res.status(error.status || 500).send({
      isTokenValid: false,
      message: message,
      success: false,
    })
  }
}
