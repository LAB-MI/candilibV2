/**
 * Vérifie le status candidat
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
export const verifyCandidatStatus = (req, res, next) => {
  const { candidatStatus } = req
  if (!candidatStatus) {
    return res.status(401).send({
      isTokenValid: false,
      message: 'Votre lien de connexion n\'est pas valide, veuillez en demander un autre via le bouton "Déjà inscrit"',
      success: false,
    })
  }
  next()
}
