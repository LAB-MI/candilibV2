export const XUserId = 'X-USER-ID'
export async function verifyUser (req, res, next) {
  const xUserId = req.get(XUserId)
  const { userId } = req

  if (!xUserId || !userId || xUserId !== userId) {
    return res.status(401).send({
      isTokenValid: false,
      message: 'Votre lien de connexion n\'est pas valide, veuillez en demander un autre via le bouton "Déjà inscrit"',
      success: false,
    })
  }

  next()
}
