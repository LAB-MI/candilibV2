import { appLogger } from '../../util'

/**
 * Vérifie le status candidat
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const verifyCandidatStatus = (req, res, next) => {
  const { candidatStatus } = req
  if (!candidatStatus) {
    appLogger.error({
      request_id: req.request_id,
      section: 'verifyCandidatStatus',
      candidatStatus,
      description: 'Pas de status pour ce candidat',
    })
    return res.status(401).send({
      isTokenValid: false,
      message: 'Votre lien de connexion n\'est pas valide, veuillez en demander un autre via le bouton "Déjà inscrit"',
      success: false,
    })
  }
  next()
}
