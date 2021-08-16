import { validate as uuidValidate, version as uuidVersion } from 'uuid'
import { version } from '../../../package.json'

export const XUserId = 'X-USER-ID'

export async function verifyUser (req, res, next) {
  const xUserId = req.get(XUserId)
  const { userId } = req
  const clientId = req.headers['x-client-id'].split(`.${version}`)[0]
  const message = 'Votre lien de connexion n\'est pas valide, veuillez en demander un autre via le bouton "Déjà inscrit"'

  try {
    const isVersion = await uuidVersion(clientId)
    const valideClientId = await uuidValidate(clientId)

    if (!xUserId || !userId || xUserId !== userId || !valideClientId || isVersion !== 4) {
      throw Error(message)
    }

    next()
  } catch (error) {
    return res.status(401).send({
      isTokenValid: false,
      message: error.message === 'Invalid UUID' ? message : error.message,
      success: false,
    })
  }
}
